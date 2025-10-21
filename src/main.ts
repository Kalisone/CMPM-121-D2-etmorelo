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

class CommandSticker {
  sticker: string;
  point: { x: number; y: number };
  constructor(x: number, y: number, sticker: string) {
    this.point = { x, y };
    this.sticker = sticker;
  }

  draw(context: CanvasRenderingContext2D) {
    context.font = "32px";
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillText(this.sticker, this.point.x, this.point.y);
  }

  drag(x: number, y: number) {
    this.point = { x, y };
  }
}

class CommandCursor {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(context: CanvasRenderingContext2D) {
    const marker = buttons_markerTool.find((b) =>
      b.classList.contains("selectedTool")
    );

    if (marker === buttonMarkerThin || marker === buttonMarkerThick) {
      context.beginPath();
      context.arc(
        this.x,
        this.y,
        markerCommandCurrent.Thickness,
        0,
        2 * Math.PI,
      );
      context.lineWidth = 1;
      context.stroke();
    } else if (marker) {
      context.font = "32px monospace";
      context.fillStyle = "rgba(255, 255, 255, 0.60)";
      context.fillText(marker.innerHTML, this.x, this.y);
    }
  }
}

const lineCommands: CommandLine[] = [];
const lineCommandsUndone: CommandLine[] = [];
const markerCommandThin: CommandMarker = new CommandMarker(2);
const markerCommandThick: CommandMarker = new CommandMarker(4);
const stickerCommands: CommandSticker[] = [];
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
  stickerCommands.forEach((command) => command.draw(context));

  if (cursorCommand) {
    cursorCommand.draw(context);
  }

  isDirty = false;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    redraw();
  }
}

function switchSelectedButton(
  selected: HTMLButtonElement,
  buttons: HTMLButtonElement[],
  classListName: string,
) {
  for (const button of buttons) {
    button.classList.remove(classListName);
  }

  selected.classList.add(classListName);
}

/* **** **** **** ****
 * CANVAS CHANGES (EVENT LISTENERS)
 * **** **** **** ****/
canvas.addEventListener("drawing-changed", markDirty);
canvas.addEventListener("tool-moved", markDirty);

let lineCommandCurrent: CommandLine | null = null;
let markerCommandCurrent: CommandMarker = markerCommandThin;
let stickerCommandCurrent: CommandSticker | null = null;

redraw();

// DRAWING IN CANVAS
// Click
canvas.addEventListener("mousedown", (e) => {
  const marker = buttons_markerTool.find((b) =>
    b.classList.contains("selectedTool")
  );

  if (marker === buttonMarkerThin || marker === buttonMarkerThick) {
    lineCommandCurrent = new CommandLine(
      e.offsetX,
      e.offsetY,
      markerCommandCurrent.Thickness,
    );
    lineCommands.push(lineCommandCurrent);
    lineCommandsUndone.splice(0, lineCommandsUndone.length);
  } else if (marker) {
    stickerCommandCurrent = new CommandSticker(
      e.offsetX,
      e.offsetY,
      marker.innerHTML,
    );
    stickerCommands.push(stickerCommandCurrent);
  }

  notify("drawing-changed");
});

// Unclick
canvas.addEventListener("mouseup", () => {
  lineCommandCurrent = null;
  stickerCommandCurrent = null;

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
    const marker = buttons_markerTool.find((b) =>
      b.classList.contains("selectedTool")
    );
    if (marker === buttonMarkerThin || marker === buttonMarkerThick) {
      lineCommandCurrent!.points.push({
        x: e.offsetX,
        y: e.offsetY,
        lw: markerCommandCurrent.Thickness,
      });
    } else if (marker) {
      stickerCommandCurrent!.drag(e.offsetX, e.offsetY);
    }

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
// MARKER STYLING (LINE THICKNESS)
const buttons_markerTool: HTMLButtonElement[] = [];

const buttonMarkerThin = document.createElement("button");
buttonMarkerThin.innerHTML = "THIN";
document.body.append(buttonMarkerThin);
buttons_markerTool.push(buttonMarkerThin);
buttonMarkerThin.classList.add("selectedTool");

buttonMarkerThin.addEventListener("click", () => {
  switchSelectedButton(buttonMarkerThin, buttons_markerTool, "selectedTool");
  markerCommandCurrent = markerCommandThin;

  notify("drawing-changed");
});

const buttonMarkerThick = document.createElement("button");
buttonMarkerThick.innerHTML = "THICK";
document.body.append(buttonMarkerThick);
buttons_markerTool.push(buttonMarkerThick);

buttonMarkerThick.addEventListener("click", () => {
  switchSelectedButton(buttonMarkerThick, buttons_markerTool, "selectedTool");
  markerCommandCurrent = markerCommandThick;

  notify("drawing-changed");
});

document.body.append(document.createElement("br"));

// MARKER STICKERS (EMOJIS)
const buttonStickerCookie = document.createElement("button");
buttonStickerCookie.innerHTML = "🍪";
document.body.append(buttonStickerCookie);
buttons_markerTool.push(buttonStickerCookie);

buttonStickerCookie.addEventListener("click", (e) => {
  switchSelectedButton(buttonStickerCookie, buttons_markerTool, "selectedTool");
  stickerCommands.push(new CommandSticker(e.x, e.y, "🍪"));

  notify("tool-moved");
});

const buttonStickerStar = document.createElement("button");
buttonStickerStar.innerHTML = "⭐";
document.body.append(buttonStickerStar);
buttons_markerTool.push(buttonStickerStar);

buttonStickerStar.addEventListener("click", (e) => {
  switchSelectedButton(buttonStickerStar, buttons_markerTool, "selectedTool");
  stickerCommands.push(new CommandSticker(e.x, e.y, "⭐"));

  notify("tool-moved");
});

const buttonStickerSkull = document.createElement("button");
buttonStickerSkull.innerHTML = "💀";
document.body.append(buttonStickerSkull);
buttons_markerTool.push(buttonStickerSkull);

buttonStickerSkull.addEventListener("click", (e) => {
  switchSelectedButton(buttonStickerSkull, buttons_markerTool, "selectedTool");
  stickerCommands.push(new CommandSticker(e.x, e.y, "💀"));

  notify("tool-moved");
});

// ACTION CHANGES (CLEAR, UNDO, REDO)
document.body.append(document.createElement("br"));

const buttonClear = document.createElement("button");
buttonClear.innerHTML = "CLEAR";
document.body.append(buttonClear);

buttonClear.addEventListener("click", () => {
  lineCommands.splice(0, lineCommands.length);
  lineCommandsUndone.splice(0, lineCommandsUndone.length);
  stickerCommands.splice(0, stickerCommands.length);

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
