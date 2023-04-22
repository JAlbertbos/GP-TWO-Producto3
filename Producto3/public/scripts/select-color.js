
let selectedColor = "black";
const circles = document.querySelectorAll(".circle");
const description = document.querySelector("textarea");

circles.forEach(circle => {
    circle.addEventListener("click", () => {
        selectedColor = circle.classList[1];
        description.style.borderColor = selectedColor;
    });
});