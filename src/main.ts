import "./style.css";

document.body.innerHTML = `
  <h1>Pinta Lite</h1>
  <hr><br>
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

function notify(name: string) {
  canvas.dispatchEvent(new Event(name));
}

let isDirty: boolean = true;

function redraw() {
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

  isDirty = false;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    redraw();
  }
}

canvas.addEventListener("drawing-changed", markDirty);

redraw();

// Draw in canvas
canvas.addEventListener("mousedown", (e) => {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  cursor.isDrawing = true;

  lineCurrent = [];
  lines.push(lineCurrent);
  linesUndone.splice(0, linesUndone.length);
  lineCurrent.push({ x: cursor.x, y: cursor.y });

  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.isDrawing) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    lineCurrent?.push({ x: cursor.x, y: cursor.y });

    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.isDrawing = false;
  lineCurrent = null;

  notify("drawing-changed");
});

document.body.append(
  document.createElement("br"),
  document.createElement("br"),
);

/* **** **** **** ****
 * BUTTONS
 * **** **** **** ****/
const buttonClear = document.createElement("button");
buttonClear.innerHTML = "CLEAR";
document.body.append(buttonClear);

buttonClear.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  lines.length = 0;
  linesUndone.length = 0;
});

const buttonUndo = document.createElement("button");
buttonUndo.innerHTML = "UNDO";
document.body.append(buttonUndo);

buttonUndo.addEventListener("click", () => {
  if (lines.length > 0) {
    linesUndone.push(lines.pop()!);

    notify("drawing-changed");
  }
});

const buttonRedo = document.createElement("button");
buttonRedo.innerHTML = "REDO";
document.body.append(buttonRedo);

buttonRedo.addEventListener("click", () => {
  if (linesUndone.length > 0) {
    lines.push(linesUndone.pop()!);

    notify("drawing-changed");
  }
});
