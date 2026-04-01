const score = sessionStorage.getItem("reactionTime");

console.log("Time difference: " + score + " milliseconds");

document.getElementById("score").innerText = score + " milliseconds";