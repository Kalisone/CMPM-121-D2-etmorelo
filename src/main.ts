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
canvas.style.cursor = "none";
canvas.classList.add("canvas");
document.body.append(canvas);

const context = canvas.getContext("2d")!;

/* **** **** **** ****
 * COMMANDS
 * **** **** **** ****/
class CommandLine {
  points: { x: number; y: number; lw: number }[];

  constructor(x: number, y: number, lw: number) {
    this.points = [{ x, y, lw }];
  }

  display(context: CanvasRenderingContext2D) {
    if (!this.points[0]) {
      return;
    }

    context.strokeStyle = "black";
    context.beginPath();

    const { x, y } = { x: this.points[0].x, y: this.points[0].y };

    context.moveTo(x, y);

    for (const { x, y, lw } of this.points.slice(1)) {
      context.lineWidth = lw;
      context.lineTo(x, y);
    }

    context.stroke();
  }

  grow(x: number, y: number, lw: number) {
    this.points.push({ x, y, lw });
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

class CommandCursor {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    context.stroke();
  }
}

const lineCommands: CommandLine[] = [];
const lineCommandsUndone: CommandLine[] = [];
const markerCommandThin: CommandMarker = new CommandMarker(2);
const markerCommandThick: CommandMarker = new CommandMarker(4);
let cursorCommand: CommandCursor | null = null;

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

  if (cursorCommand) {
    cursorCommand.display(context);
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
canvas.addEventListener("tool-moved", markDirty);

let lineCommandCurrent: CommandLine | null = null;
let markerCommandCurrent: CommandMarker = markerCommandThin;

redraw();

/* **** **** **** ****
 * EVENT LISTENERS
 * **** **** **** ****/
// DRAWING IN CANVAS
// Click
canvas.addEventListener("mousedown", (e) => {
  lineCommandCurrent = new CommandLine(
    e.offsetX,
    e.offsetY,
    markerCommandCurrent.Thickness,
  );
  lineCommands.push(lineCommandCurrent);
  lineCommandsUndone.splice(0, lineCommandsUndone.length);

  notify("drawing-changed");
});

// Unclick
canvas.addEventListener("mouseup", () => {
  lineCommandCurrent = null;

  notify("drawing-changed");
});

// CURSOR + DRAWING IN CANVAS
// Drag
canvas.addEventListener("mousemove", (e) => {
  // Cursor
  cursorCommand = new CommandCursor(e.offsetX, e.offsetY);
  notify("tool-moved");

  // Drawing in Canvas
  if (e.buttons == 1) {
    lineCommandCurrent!.points.push({
      x: e.offsetX,
      y: e.offsetY,
      lw: markerCommandCurrent.Thickness,
    });

    notify("drawing-changed");
  }
});

// CURSOR
canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new CommandCursor(e.offsetX, e.offsetY);
  notify("tool-moved");
});

document.body.append(
  document.createElement("br"),
  document.createElement("br"),
);

/* **** **** **** ****
 * BUTTONS
 * **** **** **** ****/
const buttons_markerThickness: HTMLButtonElement[] = [];

const buttonMarkerThin = document.createElement("button");
buttonMarkerThin.innerHTML = "THIN";
document.body.append(buttonMarkerThin);
buttons_markerThickness.push(buttonMarkerThin);
buttonMarkerThin.classList.add("selectedTool");

buttonMarkerThin.addEventListener("click", () => {
  for (const button of buttons_markerThickness) {
    button.classList.remove("selectedTool");
  }

  buttonMarkerThin.classList.add("selectedTool");
  markerCommandCurrent = markerCommandThin;

  notify("drawing-changed");
});

const buttonMarkerThick = document.createElement("button");
buttonMarkerThick.innerHTML = "THICK";
document.body.append(buttonMarkerThick);
buttons_markerThickness.push(buttonMarkerThick);

buttonMarkerThick.addEventListener("click", () => {
  for (const button of buttons_markerThickness) {
    button.classList.remove("selectedTool");
  }

  buttonMarkerThick.classList.add("selectedTool");
  markerCommandCurrent = markerCommandThick;

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
