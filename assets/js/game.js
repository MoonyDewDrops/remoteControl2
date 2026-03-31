function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setTimeout(function () {
    document.getElementById("game-container").style.backgroundColor = "red";
    const dateNow = new Date();
    // console.log("Game started at: " + dateNow);
    document.getElementById("game-container").addEventListener("click", function () {
        const dateThen = new Date();
        // console.log("Clicked at: " + dateThen);
        const timeDiff = dateThen - dateNow;
        // console.log("Time difference: " + timeDiff + " milliseconds");
        sessionStorage.setItem("reactionTime", timeDiff);
        window.location.href = "rankings.php";
    });
}, (getRandomIntInclusive(2, 5) * 1000));