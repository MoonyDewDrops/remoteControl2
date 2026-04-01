<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>enterGame</title>
    <link rel="stylesheet" href="assets/css/enterGame.css">
</head>
<body>

<h1>Code?</h1>
<form action="" method="post" id="gameForm1" type="visible">
    <input type="text" name="gameCode" placeholder="Enter Game Code" required>
    <button type="submit">Enter Code</button>
</form>
<form action="game.php" method="post" id="gameForm2" type="hidden">
    <input type="text" name="playerNickname" id="playerNickname" placeholder="Enter Nickname" required>
    <button type="submit">Join Game</button>   
</form>

    <script src="assets/js/enterGame.js"></script>
</body>
</html>