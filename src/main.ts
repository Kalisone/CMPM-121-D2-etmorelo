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

/* **** **** **** ****
 * COMMANDS
 * **** **** **** ****/
class CommandLine {
  points: { x: number; y: number }[];

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }

  display(context: CanvasRenderingContext2D) {
    if (!this.points[0]) {
      return;
    }

    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.beginPath();

    const { x, y } = this.points[0];

    context.moveTo(x, y);

    for (const { x, y } of this.points.slice(1)) {
      context.lineTo(x, y);
    }

    context.stroke();
  }

  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

const commands: CommandLine[] = [];
const commandsUndone: CommandLine[] = [];

/* DELETE */
//const lines: { x: number; y: number }[][] = [];
//const linesUndone: { x: number; y: number }[][] = [];

//let lineCurrent: { x: number; y: number }[] | null = null;

//const cursor = { isDrawing: false, x: 0, y: 0 };
/* END DELETE */

/* **** **** **** ****
 * FUNCTIONS
 * **** **** **** ****/
function notify(name: string) {
  canvas.dispatchEvent(new Event(name));
}

let isDirty: boolean = true;

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  commands.forEach((command) => command.display(context));

  /*
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
  */

  isDirty = false;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    redraw();
  }
}

canvas.addEventListener("drawing-changed", markDirty);
let lineCommandCurrent: CommandLine | null = null;

redraw();

/* **** **** **** ****
 * EVENT LISTENERS
 * **** **** **** ****/
// Draw in canvas
canvas.addEventListener("mousedown", (e) => {
  /*
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  cursor.isDrawing = true;

  lineCurrent = [];
  lines.push(lineCurrent);
  linesUndone.splice(0, linesUndone.length);
  lineCurrent.push({ x: cursor.x, y: cursor.y });
  */
  lineCommandCurrent = new CommandLine(e.offsetX, e.offsetY);
  commands.push(lineCommandCurrent);
  commandsUndone.splice(0, commandsUndone.length);

  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons == 1) {
    /*
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    lineCurrent?.push({ x: cursor.x, y: cursor.y });
    */
    lineCommandCurrent!.points.push({ x: e.offsetX, y: e.offsetY });

    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
  //cursor.isDrawing = false;
  lineCommandCurrent = null;

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
  /*
  context.clearRect(0, 0, canvas.width, canvas.height);
  lines.length = 0;
  linesUndone.length = 0;
  */
  commands.splice(0, commands.length);
  notify("drawing-changed");
});

const buttonUndo = document.createElement("button");
buttonUndo.innerHTML = "UNDO";
document.body.append(buttonUndo);

buttonUndo.addEventListener("click", () => {
  if (commands.length > 0) {
    commandsUndone.push(commands.pop()!);

    notify("drawing-changed");
  }
});

const buttonRedo = document.createElement("button");
buttonRedo.innerHTML = "REDO";
document.body.append(buttonRedo);

buttonRedo.addEventListener("click", () => {
  if (commandsUndone.length > 0) {
    commands.push(commandsUndone.pop()!);

    notify("drawing-changed");
  }
});
