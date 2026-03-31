<?php
session_start();

if (!isset($_SESSION['chosenGame'])) {
    $gameStatus = "gameChosen";
    $_SESSION['chosenGame'] = $gameStatus;
} else {
    $gameStatus = "";
    $_SESSIONS['gameStatus'] = $gameStatus;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Display</title>
    <link rel="stylesheet" href="assets/css/display.css">
</head>
<body>
    <div>
        <h1>Game?</h1>

        <div><img src="assets/images/game.png" alt="Game Image"></div>
        <div><img src="assets/images/game2.png" alt="Game Image 2"></div>
        <div><img src="assets/images/game3.png" alt="Game Image 3"></div>

    </div>

    <div>
        <h1>Code: <?php echo $_SESSION['gameCode']; ?></h1>

    </div>


    <script src="assets/js/display.js"></script>
</body>
</html>