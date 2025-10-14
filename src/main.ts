import "./style.css";

document.body.innerHTML = `
  <h1>CMPM 121 D2</h1>
  <hr>
`;

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("canvas");
document.body.append(canvas);

const context = canvas.getContext("2d")!;
const cursor = { isDrawing: false, x: 0, y: 0 };

// Draw in canvas
canvas.addEventListener("mousedown", (e) => {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  cursor.isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.isDrawing) {
    drawLine(context, cursor.x, cursor.y, e.offsetX, e.offsetY);
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (cursor.isDrawing) {
    drawLine(context, cursor.x, cursor.y, e.offsetX, e.offsetY);
    cursor.x = 0;
    cursor.y = 0;
  }

  cursor.isDrawing = false;
});

document.body.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
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
