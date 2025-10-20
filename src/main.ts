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
    context.lineWidth = markerCommand.Thickness;
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

class CommandMarker {
  sizeMarker: number | null = null;

  constructor(sizeMarker: number) {
    this.Thickness = sizeMarker;
  }

  set Thickness(sizeMarker: number) {
    this.sizeMarker = sizeMarker;
  }

  get Thickness() {
    return (this.sizeMarker ? this.sizeMarker : 0);
  }
}

const lineCommands: CommandLine[] = [];
const lineCommandsUndone: CommandLine[] = [];
const markerCommand: CommandMarker = new CommandMarker(2);

/* **** **** **** ****
 * FUNCTIONS
 * **** **** **** ****/
function notify(name: string) {
  canvas.dispatchEvent(new Event(name));
}

let isDirty: boolean = true;

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  lineCommands.forEach((command) => command.display(context));
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
  lineCommandCurrent = new CommandLine(e.offsetX, e.offsetY);
  lineCommands.push(lineCommandCurrent);
  lineCommandsUndone.splice(0, lineCommandsUndone.length);

  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons == 1) {
    lineCommandCurrent!.points.push({ x: e.offsetX, y: e.offsetY });

    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
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
const buttonMarkerThin = document.createElement("button");
buttonMarkerThin.innerHTML = "THIN";
document.body.append(buttonMarkerThin);

buttonMarkerThin.addEventListener("click", () => {
  markerCommand.Thickness = 2;

  notify("drawing-changed");
});

const buttonMarkerThick = document.createElement("button");
buttonMarkerThick.innerHTML = "THICK";
document.body.append(buttonMarkerThick);

buttonMarkerThick.addEventListener("click", () => {
  markerCommand.Thickness = 4;

  notify("drawing-changed");
});

document.body.append(document.createElement("br"));

const buttonClear = document.createElement("button");
buttonClear.innerHTML = "CLEAR";
document.body.append(buttonClear);

buttonClear.addEventListener("click", () => {
  lineCommands.splice(0, lineCommands.length);
  lineCommandsUndone.splice(0, lineCommandsUndone.length);

  notify("drawing-changed");
});

const buttonUndo = document.createElement("button");
buttonUndo.innerHTML = "UNDO";
document.body.append(buttonUndo);

buttonUndo.addEventListener("click", () => {
  if (lineCommands.length > 0) {
    lineCommandsUndone.push(lineCommands.pop()!);

    notify("drawing-changed");
  }
});

const buttonRedo = document.createElement("button");
buttonRedo.innerHTML = "REDO";
document.body.append(buttonRedo);

buttonRedo.addEventListener("click", () => {
  if (lineCommandsUndone.length > 0) {
    lineCommands.push(lineCommandsUndone.pop()!);

    notify("drawing-changed");
  }
});
