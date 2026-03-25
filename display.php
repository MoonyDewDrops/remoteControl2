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
</head>
<body>
    
</body>
</html>