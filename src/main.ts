import "./style.css";

document.body.innerHTML = `
  <h1>CMPM 121 D2</h1>
  <hr>
`;

/* **** **** **** ****
 * CANVAS
 * **** **** **** ****/
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("canvas");
document.body.append(canvas);

const context = canvas.getContext("2d")!;

const lines: { x: number; y: number }[][] = [];
const linesUndone: { x: number; y: number }[][] = [];

let lineCurrent: { x: number; y: number }[] | null = null;

const cursor = { isDrawing: false, x: 0, y: 0 };

// Draw in canvas
canvas.addEventListener("mousedown", (e) => {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  cursor.isDrawing = true;

  lineCurrent = [];
  lines.push(lineCurrent);
  linesUndone.splice(0, linesUndone.length);
  lineCurrent.push({ x: cursor.x, y: cursor.y });

  drawLine();
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.isDrawing) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    lineCurrent?.push({ x: cursor.x, y: cursor.y });

    drawLine();
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.isDrawing = false;
  lineCurrent = null;

  drawLine();
});

function drawLine() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const line of lines) {
    if (line.length > 1) {
      context.beginPath();

      if (line[0]) {
        const { x, y } = line[0];
        context.moveTo(x, y);
      }

      for (const { x, y } of line) {
        context.lineTo(x, y);
      }

      context.stroke();
    }
  }
}
/*
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
*/
document.body.append(document.createElement("br"));

/* **** **** **** ****
 * BUTTONS
 * **** **** **** ****/
const buttonClear = document.createElement("button");
buttonClear.innerHTML = "clear";
document.body.append(buttonClear);

buttonClear.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});
