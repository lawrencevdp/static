const expressionDisplay = document.querySelector("#expression");
const resultDisplay = document.querySelector("#result");
let expression = "";
let justCalculated = false;

function render(value = expression, result = "0") {
  expressionDisplay.textContent = value || "0";
  resultDisplay.textContent = result;
}

function append(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
  }
  justCalculated = false;

  if (/[+\-*/%]/.test(value) && /[+\-*/%]$/.test(expression)) {
    expression = expression.slice(0, -1);
  }
  expression += value;
  render(expression, expression);
}

function evaluateExpression(source) {
  let position = 0;

  function parseExpression() {
    let value = parseTerm();
    while (source[position] === "+" || source[position] === "-") {
      const operator = source[position++];
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parseUnary();
    while (source[position] === "*" || source[position] === "/" || source[position] === "%") {
      const operator = source[position++];
      const right = parseUnary();
      if ((operator === "/" || operator === "%") && right === 0) {
        throw new Error("Cannot divide by zero.");
      }
      if (operator === "*") value *= right;
      else if (operator === "/") value /= right;
      else value %= right;
    }
    return value;
  }

  function parseUnary() {
    if (source[position] === "+") {
      position++;
      return parseUnary();
    }
    if (source[position] === "-") {
      position++;
      return -parseUnary();
    }
    return parseNumber();
  }

  function parseNumber() {
    const start = position;
    while (/[0-9]/.test(source[position] || "")) position++;
    if (source[position] === ".") {
      position++;
      while (/[0-9]/.test(source[position] || "")) position++;
    }
    if (position === start || (source[position - 1] === "." && position - start === 1)) {
      throw new Error("Enter a valid expression.");
    }

    const value = Number(source.slice(start, position));
    if (!Number.isFinite(value)) throw new Error("Result is out of range.");
    return value;
  }

  const result = parseExpression();
  if (position !== source.length) throw new Error("Enter a valid expression.");
  if (!Number.isFinite(result)) throw new Error("Result is out of range.");
  return result;
}

function calculate() {
  if (!expression) return;

  try {
    expression = String(evaluateExpression(expression));
    render(expression, expression);
    justCalculated = true;
  } catch (error) {
    resultDisplay.textContent = error instanceof Error ? error.message : "Calculation failed.";
    justCalculated = false;
  }
}

function handleAction(action) {
  if (action === "clear") {
    expression = "";
    justCalculated = false;
    render();
  } else if (action === "backspace") {
    expression = expression.slice(0, -1);
    render(expression, expression || "0");
  } else if (action === "sign") {
    expression = expression.startsWith("-") ? expression.slice(1) : `-${expression}`;
    render(expression, expression);
  } else if (action === "equals") {
    void calculate();
  }
}

document.querySelector(".keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action) handleAction(button.dataset.action);
  else append(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.+\-*/%]$/.test(event.key)) {
    append(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    calculate();
  } else if (event.key === "Backspace") {
    handleAction("backspace");
  } else if (event.key === "Escape") {
    handleAction("clear");
  }
});

render();
