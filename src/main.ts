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
  static colors = [
    "#000000",
    "#ff0000",
    "#ffaa00",
    "#00cc00",
    "#1240ab",
    "#7109aa",
  ];
  static nextColor = CommandLine.colors[0]!;

  private points: { x: number; y: number; lw: number }[];
  private color = CommandLine.nextColor;

  constructor(x: number, y: number, lw: number) {
    this.points = [{ x, y, lw }];
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this.points[0]) {
      return;
    }

    context.strokeStyle = this.color;
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

  get Points() {
    return this.points;
  }

  get Color() {
    return this.color;
  }

  static randColor() {
    const validColors = CommandLine.colors.filter((c) =>
      c != CommandLine.nextColor
    );

    CommandLine.nextColor =
      validColors[Math.floor(Math.random() * validColors.length)]!;
  }
}

class CommandMarker {
  private sizeMarker: number | null = null;

  constructor(sizeMarker: number) {
    this.thickness = sizeMarker;
  }

  set thickness(sizeMarker: number) {
    this.sizeMarker = sizeMarker;
  }

  get thickness() {
    return (this.sizeMarker ? this.sizeMarker : 0);
  }
}

class CommandSticker {
  private sticker: string;
  private point: { x: number; y: number };
  private size: number;

  constructor(x: number, y: number, sticker: string) {
    this.point = { x, y };
    this.sticker = sticker;
    this.size = 32;
  }

  draw(context: CanvasRenderingContext2D) {
    context.font = `${String(this.size)}px sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillText(this.sticker, this.point.x, this.point.y);
  }

  drag(x: number, y: number) {
    this.point = { x, y };
  }

  get Size() {
    return this.size;
  }

  set Size(size: number) {
    this.size = size;
  }
}

class CommandCursor {
  private x: number;
  private y: number;

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
        markerCommandCurrent.thickness,
        0,
        2 * Math.PI,
      );
      context.lineWidth = 2;
      context.strokeStyle = CommandLine.nextColor;
      context.stroke();
    } else if (marker) {
      context.font = "32px monospace";
      context.fillStyle = "rgba(255, 255, 255, 0.60)";
      context.fillText(marker.dataset.sticker!, this.x, this.y);
    }
  }
}

const drawCommands: (CommandLine | CommandSticker)[] = [];
const drawCommandsUndone: (CommandLine | CommandSticker)[] = [];
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
  drawCommands.forEach((command) => command.draw(context));

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

  CommandLine.randColor();
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
      markerCommandCurrent.thickness,
    );

    drawCommands.push(lineCommandCurrent);
  } else if (marker) {
    stickerCommandCurrent = new CommandSticker(
      e.offsetX,
      e.offsetY,
      marker.dataset.sticker!,
    );

    drawCommands.push(stickerCommandCurrent);
  }

  drawCommandsUndone.splice(0, drawCommandsUndone.length);
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
      lineCommandCurrent!.Points.push({
        x: e.offsetX,
        y: e.offsetY,
        lw: markerCommandCurrent.thickness,
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

document.body.append(
  document.createElement("br"),
  document.createElement("br"),
);

// MARKER STICKERS (EMOJIS: BUILT-IN, CUSTOM)
const stickers: string[] = ["🎃", "🕸️", "💀"];
const stickersBaseLen = stickers.length;

for (let i = 0; i < 3; i++) {
  const buttonSticker = document.createElement("button");
  buttonSticker.innerHTML = stickers[i]!;
  buttonSticker.dataset.sticker = stickers[i];
  document.body.append(buttonSticker);

  buttons_markerTool.push(buttonSticker);

  buttonSticker.addEventListener("click", () => {
    switchSelectedButton(buttonSticker, buttons_markerTool, "selectedTool");

    notify("tool-moved");
  });
}

const buttonStickerCustom = document.createElement("button");
buttonStickerCustom.innerHTML = "[CUSTOM]";
document.body.append(buttonStickerCustom);

buttonStickerCustom.addEventListener("click", () => {
  const sticker = prompt("Enter custom sticker");

  if (sticker) {
    while (stickers.length > stickersBaseLen) {
      stickers.pop();
    }

    stickers.push(sticker);
  }

  buttonStickerCustom.innerHTML = stickers[stickers.length - 1]!;
  buttonStickerCustom.dataset.sticker = stickers[stickers.length - 1];
  buttons_markerTool.push(buttonStickerCustom);
  console.log(sticker);

  switchSelectedButton(buttonStickerCustom, buttons_markerTool, "selectedTool");

  if (sticker) {
    notify("tool-moved");
  }
});

// ACTION CHANGES (CLEAR, UNDO, REDO, EXPORT)
document.body.append(
  document.createElement("br"),
  document.createElement("br"),
);

const buttonClear = document.createElement("button");
buttonClear.innerHTML = "CLEAR";
document.body.append(buttonClear);

buttonClear.addEventListener("click", () => {
  drawCommands.splice(0, drawCommands.length);
  drawCommandsUndone.splice(0, drawCommandsUndone.length);
  drawCommands.splice(0, drawCommands.length);

  notify("drawing-changed");
});

const buttonUndo = document.createElement("button");
buttonUndo.innerHTML = "UNDO";
document.body.append(buttonUndo);

buttonUndo.addEventListener("click", () => {
  if (drawCommands.length > 0) {
    drawCommandsUndone.push(drawCommands.pop()!);

    notify("drawing-changed");
  }
});

const buttonRedo = document.createElement("button");
buttonRedo.innerHTML = "REDO";
document.body.append(buttonRedo);

buttonRedo.addEventListener("click", () => {
  if (drawCommandsUndone.length > 0) {
    drawCommands.push(drawCommandsUndone.pop()!);

    notify("drawing-changed");
  }
});

const buttonExport = document.createElement("button");
buttonExport.innerHTML = "EXPORT";
document.body.append(buttonExport);

buttonExport.addEventListener("click", () => {
  const xCanvas = document.createElement("canvas");
  const scale = 4;

  xCanvas.width = canvas.width * scale;
  xCanvas.height = canvas.height * scale;

  const xCtx = xCanvas.getContext("2d")!;
  xCtx.scale(scale, scale);
  xCtx.fillStyle = "#ffffff";
  xCtx.fillRect(0, 0, xCanvas.width, xCanvas.height);

  drawCommands.forEach((command) => command.draw(xCtx));

  const imgDataURL = xCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "pinta-sketch.png";
  link.href = imgDataURL;
  link.click();
});

// LINK
document.body.append(
  document.createElement("br"),
  document.createElement("br"),
  document.createElement("br"),
);

const buttonEmojiLink = document.createElement("button");
buttonEmojiLink.innerHTML = "Emojipedia";
document.body.append(buttonEmojiLink);
buttonEmojiLink.classList.add("buttonLink");

buttonEmojiLink.addEventListener("click", () => {
  globalThis.open("https://emojipedia.org/");
});
