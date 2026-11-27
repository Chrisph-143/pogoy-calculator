// ELEMENTS
const calculatorEl = document.getElementById("calculator");
const currentDisplay = document.getElementById("current");
const previousDisplay = document.getElementById("previous");

const numberButtons = document.querySelectorAll(".num");
const operationButtons = document.querySelectorAll(".op");
const clearButton = document.getElementById("all-clear");
const deleteButton = document.getElementById("delete");
const percentButton = document.getElementById("percent");
const decimalButton = document.getElementById("decimal");
const equalButton = document.getElementById("equal");

const videoPrankDiv = document.getElementById("video-prank");
const prankVideo = document.getElementById("prank-video");

// CALCULATOR STATE
let current = "";
let previous = "";
let operation = "";
let overwrite = false;   // true right after "=" so the next digit starts fresh
let prankActive = false;

const MAX_DIGITS = 15;
const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ---------- DISPLAY ----------

function updateDisplay() {
    currentDisplay.textContent = current || previous || "0";
    previousDisplay.textContent =
        previous && operation ? previous + " " + SYMBOLS[operation] : "";
    fitText();
}

// Shrink the big number until it fits on one line
function fitText() {
    currentDisplay.style.fontSize = "";
    let size = parseFloat(getComputedStyle(currentDisplay).fontSize);
    while (currentDisplay.scrollWidth > currentDisplay.clientWidth && size > 16) {
        size -= 2;
        currentDisplay.style.fontSize = size + "px";
    }
}
window.addEventListener("resize", fitText);

// ---------- HELPERS ----------

function showError() {
    current = "Error";
    previous = "";
    operation = "";
    overwrite = true;
}

function clearIfError() {
    if (current === "Error") {
        current = "";
        overwrite = false;
    }
}

// Avoids 0.1 + 0.2 = 0.30000000000000004
function tidy(n) {
    return parseFloat(n.toPrecision(12)).toString();
}

function compute(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    switch (op) {
        case "+": return tidy(x + y);
        case "-": return tidy(x - y);
        case "*": return tidy(x * y);
        case "/": return y === 0 ? null : tidy(x / y);
        default:  return null;
    }
}

// ---------- ACTIONS ----------

function inputNumber(digit) {
    clearIfError();
    if (overwrite) {
        current = "";
        overwrite = false;
    }
    if (current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
    current = current === "0" ? digit : current + digit;
    updateDisplay();
}

function inputDecimal() {
    clearIfError();
    if (overwrite) {
        current = "";
        overwrite = false;
    }
    if (current.includes(".")) return;
    if (current === "") current = "0";
    current += ".";
    updateDisplay();
}

function chooseOperation(op) {
    if (current === "Error") return;
    overwrite = false;

    if (current === "" && previous === "") return;   // nothing to operate on

    if (current === "") {                            // swap operator
        operation = op;
        updateDisplay();
        return;
    }

    if (previous !== "" && operation !== "") {       // chain: 2 + 3 +
        const result = compute(previous, current, operation);
        if (result === null) {
            showError();
            updateDisplay();
            return;
        }
        previous = result;
    } else {
        previous = current;
    }

    operation = op;
    current = "";
    updateDisplay();
}

function clearAll() {
    current = "";
    previous = "";
    operation = "";
    overwrite = false;
    updateDisplay();
}

function deleteLast() {
    if (overwrite || current === "Error") {
        clearAll();
        return;
    }
    if (current !== "") {
        current = current.slice(0, -1);
        if (current === "-") current = "";
    } else if (operation !== "") {
        // remove the operator and go back to editing the first number
        operation = "";
        current = previous;
        previous = "";
    }
    updateDisplay();
}

function percent() {
    if (current === "" || current === "Error") return;
    current = tidy(parseFloat(current) / 100);
    updateDisplay();
}

// ---------- EQUALS + VIDEO PRANK ----------

function equals() {
    if (prankActive) return;

    // Do the math first so the answer is waiting after the video
    if (current !== "" && previous !== "" && operation !== "") {
        const result = compute(previous, current, operation);
        if (result === null) {
            showError();
        } else {
            current = result;
            previous = "";
            operation = "";
            overwrite = true;
        }
    }
    updateDisplay();
    startPrank();
}

function startPrank() {
    prankActive = true;
    videoPrankDiv.style.display = "flex";
    calculatorEl.style.visibility = "hidden";

    prankVideo.currentTime = 0;
    const playing = prankVideo.play();
    // If the browser blocks playback or the file is missing, don't get stuck
    if (playing && playing.catch) playing.catch(endPrank);
}

function endPrank() {
    prankActive = false;
    prankVideo.pause();
    videoPrankDiv.style.display = "none";
    calculatorEl.style.visibility = "visible";
    updateDisplay();
}

prankVideo.addEventListener("ended", endPrank);
prankVideo.addEventListener("error", endPrank);

// ---------- BUTTON EVENTS ----------

numberButtons.forEach(btn =>
    btn.addEventListener("click", () => inputNumber(btn.dataset.num))
);
operationButtons.forEach(btn =>
    btn.addEventListener("click", () => chooseOperation(btn.dataset.op))
);
decimalButton.addEventListener("click", inputDecimal);
clearButton.addEventListener("click", clearAll);
deleteButton.addEventListener("click", deleteLast);
percentButton.addEventListener("click", percent);
equalButton.addEventListener("click", equals);

// ---------- KEYBOARD SUPPORT ----------

document.addEventListener("keydown", e => {
    if (prankActive || e.ctrlKey || e.metaKey || e.altKey) return;

    const k = e.key;
    let handled = true;

    if (k >= "0" && k <= "9") inputNumber(k);
    else if (k === ".") inputDecimal();
    else if (k === "+" || k === "-" || k === "*" || k === "/") chooseOperation(k);
    else if (k === "Enter" || k === "=") equals();
    else if (k === "Backspace") deleteLast();
    else if (k === "Escape" || k === "Delete") clearAll();
    else if (k === "%") percent();
    else handled = false;

    if (handled) e.preventDefault();
});

updateDisplay();
