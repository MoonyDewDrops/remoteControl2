document.getElementById("game1" ).addEventListener("click", function () {
    sessionStorage.setItem("chosenGame", "game1");
    window.location.href = "game.php";
});

document.getElementById("game2" ).addEventListener("click", function () {
    sessionStorage.setItem("chosenGame", "game2");
    window.location.href = "game2.php";
}); 

document.getElementById("game3" ).addEventListener("click", function () {
    sessionStorage.setItem("chosenGame", "game3");
    window.location.href = "game3.php";
});