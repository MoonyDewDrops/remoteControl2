<?php
session_start();      
session_unset();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/index.css">
    <title>Choice Page</title>
</head>
<body>
    <button onclick="location.href='display.php'">Host Game</button>
    <button onclick="location.href='enterGame.php'">Join Game</button>


    <script src="assets/js/js.js"></script>
</body>
</html>