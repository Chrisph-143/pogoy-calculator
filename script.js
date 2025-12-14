// DISPLAY
const currentDisplay = document.getElementById("current");
const previousDisplay = document.getElementById("previous");

// BUTTONS
const numberButtons = document.querySelectorAll(".num");
const operationButtons = document.querySelectorAll(".op");
const clearButton = document.getElementById("all-clear");
const deleteButton = document.getElementById("delete");
const percentButton = document.getElementById("percent");
const decimalButton = document.getElementById("decimal");
const equalButton = document.getElementById("equal");

// CALCULATOR STATE
let current = "";
let previous = "";
let operation = "";

// UPDATE DISPLAY
function updateDisplay() {
    if (previous && operation) {
        currentDisplay.textContent = previous + " " + operation + " " + current;
    } else if (previous) {
        currentDisplay.textContent = previous;
    } else {
        currentDisplay.textContent = current || "0";
    }
}

// NUMBER BUTTONS
numberButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        current += btn.dataset.num;
        updateDisplay();
    });
});

// DECIMAL BUTTON
decimalButton.addEventListener("click", () => {
    if (!current.includes(".")) {
        if (current === "") current = "0";
        current += ".";
        updateDisplay();
    }
});

// OPERATION BUTTONS
operationButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (current === "" && previous === "") return; // block first
        if (current === "" && previous !== "") {
            operation = btn.dataset.op; // replace operator
            updateDisplay();
            return;
        }
        if (previous !== "" && operation !== "") {
            calculate();
        }
        operation = btn.dataset.op;
        previous = current;
        current = "";
        updateDisplay();
    });
});

// EQUAL BUTTON
/*equalButton.addEventListener("click", () => {
    if (current === "" || previous === "" || operation === "") return;
    calculate();
    operation = "";
    previous = "";
    updateDisplay();
});*/

const videoPrankDiv = document.getElementById("video-prank");
const prankVideo = document.getElementById("prank-video");

equalButton.addEventListener("click", () => {
    // Show the video prank
    videoPrankDiv.style.display = "block";
    prankVideo.play();  // start video just in case autoplay needs trigger

    // Hide calculator while prank plays
    document.getElementById("calculator").style.display = "none";
});

// Hide video and reset calculator after video ends
prankVideo.addEventListener("ended", () => {
    videoPrankDiv.style.display = "none";
    document.getElementById("calculator").style.display = "block";

    current = "";
    previous = "";
    operation = "";
    updateDisplay();
});

// CALCULATE FUNCTION
function calculate() {
    const prevNum = parseFloat(previous);
    const currNum = parseFloat(current);
    let result;

    switch (operation) {
        case "+":
            result = prevNum + currNum;
            break;
        case "-":
            result = prevNum - currNum;
            break;
        case "*":
            result = prevNum * currNum;
            break;
        case "/":
            if (currNum === 0) {
                result = "Error";
            } else {
                result = prevNum / currNum;
            }
            break;
        default:
            return;
    }

    current = result.toString();
    previous = "";
}

// ALL CLEAR BUTTON
clearButton.addEventListener("click", () => {
    current = "";
    previous = "";
    operation = "";
    updateDisplay();
});

// DELETE BUTTON (removes numbers or operator)
deleteButton.addEventListener("click", () => {
    if (current !== "") {
        // Delete last digit in current
        current = current.slice(0, -1);
    } else if (operation !== "") {
        // Delete operator if current is empty
        operation = "";
    } else if (previous !== "") {
        // Delete last digit in previous
        previous = previous.slice(0, -1);
    }
    updateDisplay();
});

// PERCENT BUTTON
percentButton.addEventListener("click", () => {
    if (current === "") return;
    current = (parseFloat(current) / 100).toString();
    updateDisplay();
});