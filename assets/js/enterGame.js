const form1 = document.getElementById("gameForm1");
const form2 = document.getElementById("gameForm2");

form1.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission
    
    const formData = new FormData(form1);
    
    const data = {};
    formData.forEach((value, key) => {
    data[key] = value;
    });

    sessionStorage.setItem("gameCode", data.gameCode);
    form1.type = "hidden";
    form1.style.display = "none";
    form2.style.display = "flex";
    form2.type = "visible";
});

form2.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(form2);
    const data = {};
    formData.forEach((value, key) => {
    data[key] = value;
    });
    const playerNickname = data.playerNickname;
    sessionStorage.setItem("playerNickname", playerNickname);
    window.location.href = "game.php";
});