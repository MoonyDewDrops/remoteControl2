<?php
session_start();
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

        <div id="game1"><img src="assets/images/game.png" alt="Game Image"></div>
        <div id="game2"><img src="assets/images/game2.png" alt="Game Image 2"></div>
        <div id="game3"><img src="assets/images/game3.png" alt="Game Image 3"></div>

    </div>

    <div>
        <h1>Code: Joe Mama</h1>

        <!-- <h1>Code: <?php echo $_SESSION['gameCode']; ?></h1> -->

    </div>


    <script src="assets/js/display.js"></script>
</body>
</html>