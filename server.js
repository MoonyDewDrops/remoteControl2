const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");

const app = express();
const server = http.createServer(app);
// Allow clients from other devices/origins to connect (e.g. phone -> laptop).
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

const games = {};
const AVAILABLE_GAMES = [
  {
    id: "reaction_time",
    name: "Reaction Time",
    description: "Current game mode. Click when the signal appears."
  }
];

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  // Best-effort log of a reachable LAN IP for convenience.
  const nets = os.networkInterfaces();
  const lanIp =
    Object.values(nets)
      .flat()
      .find((x) => x && x.family === "IPv4" && !x.internal)?.address || HOST;

  console.log(`Server running: http://${lanIp}:${PORT}`);
});

function clearGameTimers(game) {
  if (!game) return;
  if (game.signalTimer) clearTimeout(game.signalTimer);
  if (game.roundEndTimer) clearTimeout(game.roundEndTimer);
  game.signalTimer = null;
  game.roundEndTimer = null;
}

function generateCode(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function generateUniqueCode() {
  let code;
  do {
    code = generateCode();
  } while (games[code]);
  return code;
}

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

function normalizeNickname(name) {
  return String(name || "").trim().toLowerCase();
}

function nicknameExistsInGame(game, nickname) {
  const target = normalizeNickname(nickname);
  if (!target) return false;
  if (normalizeNickname(game.hostName) === target) return true;
  return game.players.some((p) => normalizeNickname(p.nickname) === target);
}

function getGameDefinition(gameId) {
  return AVAILABLE_GAMES.find((g) => g.id === gameId) || null;
}

function getSelectedGame(game) {
  return getGameDefinition(game?.selectedGameId);
}

function buildPlayerListPayload(game) {
  const selectedGame = getSelectedGame(game);
  return {
    players: game.players,
    hostName: game.hostName,
    hostId: game.hostId,
    selectedGameId: selectedGame?.id || null,
    selectedGameName: selectedGame?.name || null
  };
}

function endGame(code) {
  const game = games[code];
  if (!game) return;

  clearGameTimers(game);
  game.state = "results";

  const sorted = [...game.players].sort((a, b) => {
    if (typeof a.reactionTime !== "number") return 1;
    if (typeof b.reactionTime !== "number") return -1;
    return a.reactionTime - b.reactionTime;
  });

  io.to(code).emit("gameEnded", sorted);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createGame", ({ nickname }) => {
    const name = nickname != null ? String(nickname).trim() : "";
    if (!name) return socket.emit("errorMessage", "Enter a nickname");

    const code = generateUniqueCode();

    games[code] = {
      hostId: socket.id,
      hostName: name,
      players: [],
      state: "lobby",
      selectedGameId: null
    };

    socket.join(code);

    socket.emit("gameCreated", { code, hostId: socket.id });
    io.to(code).emit("playerList", buildPlayerListPayload(games[code]));
  });

  socket.on("joinGame", ({ code, nickname }) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return socket.emit("errorMessage", "Game not found");
    const nick = nickname != null ? String(nickname).trim() : "";
    if (!nick) return socket.emit("errorMessage", "Enter a nickname");
    if (nicknameExistsInGame(game, nick))
      return socket.emit("errorMessage", "That nickname is already taken in this game");

    game.players.push({ id: socket.id, nickname: nick, reactionTime: null });
    socket.join(roomCode);

    io.to(roomCode).emit("playerList", buildPlayerListPayload(game));

    socket.emit("joinedRoom", { code: roomCode });
  });

  socket.on("getAvailableGames", (code) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return;
    if (socket.id !== game.hostId) return;
    socket.emit("availableGames", {
      games: AVAILABLE_GAMES,
      selectedGameId: game.selectedGameId
    });
  });

  socket.on("startGame", (payload) => {
    const roomCode = normalizeCode(typeof payload === "string" ? payload : payload?.code);
    const requestedGameId =
      typeof payload === "object" && payload ? String(payload.gameId || "").trim() : "";
    const game = games[roomCode];
    if (!game) return;
    if (socket.id !== game.hostId) return;
    if (game.players.length === 0)
      return socket.emit("errorMessage", "Need at least one player to start");

    const selectedGameId = requestedGameId || game.selectedGameId || AVAILABLE_GAMES[0]?.id;
    const selectedGame = getGameDefinition(selectedGameId);
    if (!selectedGame) return socket.emit("errorMessage", "Selected game is not available");
    game.selectedGameId = selectedGame.id;

    clearGameTimers(game);
    game.state = "waiting";

    game.players.forEach((p) => (p.reactionTime = null));

    io.to(roomCode).emit("gameSelected", {
      gameId: selectedGame.id,
      gameName: selectedGame.name
    });
    io.to(roomCode).emit("waitingForSignal");

    const delay = Math.random() * 3000 + 1000;

    game.signalTimer = setTimeout(() => {
      game.signalTimer = null;
      if (!games[roomCode] || game.state !== "waiting") return;
      game.state = "playing";
      game.startTime = Date.now();
      io.to(roomCode).emit("signal");

      game.roundEndTimer = setTimeout(() => {
        game.roundEndTimer = null;
        if (games[roomCode] && game.state === "playing") endGame(roomCode);
      }, 15000);
    }, delay);
  });

  socket.on("reactionClick", (code) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return;
    if (socket.id === game.hostId) return; // host cannot play
    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.reactionTime !== null) return;

    if (game.state !== "playing") {
      player.reactionTime = "Too early!";
    } else {
      player.reactionTime = Date.now() - game.startTime;
    }

    io.to(roomCode).emit("partialResults", game.players);

    const allDone = game.players.every((p) => p.reactionTime !== null);
    if (allDone) endGame(roomCode);
  });

  socket.on("playAgain", (code) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return;
    if (socket.id !== game.hostId) return;

    clearGameTimers(game);
    game.state = "lobby";
    game.players.forEach((p) => (p.reactionTime = null));

    io.to(roomCode).emit("backToLobby", game.players);
  });

  socket.on("endGame", (code) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return;
    if (socket.id !== game.hostId) return;
    clearGameTimers(game);
    io.to(roomCode).emit("gameClosed");
    delete games[roomCode];
  });

  socket.on("leaveGame", (code) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return;

    if (socket.id === game.hostId) {
      clearGameTimers(game);
      io.to(roomCode).emit("gameClosed");
      delete games[roomCode];
      socket.leave(roomCode);
      socket.emit("leftGame");
      return;
    }

    game.players = game.players.filter((p) => p.id !== socket.id);
    socket.leave(roomCode);

    io.to(roomCode).emit("playerList", buildPlayerListPayload(game));
    socket.emit("leftGame");
  });

  socket.on("disconnect", () => {
    for (const roomCode in games) {
      const game = games[roomCode];
      if (game.hostId === socket.id) {
        clearGameTimers(game);
        io.to(roomCode).emit("gameClosed");
        delete games[roomCode];
        continue;
      }
      game.players = game.players.filter((p) => p.id !== socket.id);
      io.to(roomCode).emit("playerList", buildPlayerListPayload(game));
    }
  });

  socket.on("setGame", ({ code, gameId }) => {
    const roomCode = normalizeCode(code);
    const game = games[roomCode];
    if (!game) return;
    if (socket.id !== game.hostId) return;

    const selected = getGameDefinition(gameId);
    if (!selected) return;

    game.selectedGameId = selected.id;

    io.to(roomCode).emit("playerList", buildPlayerListPayload(game));
    io.to(roomCode).emit("gameSelected", {
      gameId: selected.id,
      gameName: selected.name
    });
  });
});
