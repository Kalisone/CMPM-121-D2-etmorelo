import "./style.css";

document.body.innerHTML = `
  <h1>CMPM 121 D2</h1>
  <hr><br>
  <canvas id="canvasMain" width="256" height="256"></canvas>
  <br><br>
  <button id="buttonClear">Clear Canvas</button>
`;

const canvas = document.getElementById("canvasMain") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
const clear = document.getElementById("buttonClear")!;

let isDrawing: boolean = false;
let x = 0;
let y = 0;

// Draw in canvas
canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
  }

  isDrawing = false;
});

clear.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

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
