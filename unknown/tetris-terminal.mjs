import readline from "node:readline";

const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL = 450;

const COLORS = {
  I: "\x1b[46m  \x1b[0m",
  J: "\x1b[44m  \x1b[0m",
  L: "\x1b[43m  \x1b[0m",
  O: "\x1b[103m  \x1b[0m",
  S: "\x1b[42m  \x1b[0m",
  T: "\x1b[45m  \x1b[0m",
  Z: "\x1b[41m  \x1b[0m",
  empty: "  "
};

const SHAPES = [
  { type: "I", matrix: [[1, 1, 1, 1]] },
  { type: "J", matrix: [[1, 0, 0], [1, 1, 1]] },
  { type: "L", matrix: [[0, 0, 1], [1, 1, 1]] },
  { type: "O", matrix: [[1, 1], [1, 1]] },
  { type: "S", matrix: [[0, 1, 1], [1, 1, 0]] },
  { type: "T", matrix: [[0, 1, 0], [1, 1, 1]] },
  { type: "Z", matrix: [[1, 1, 0], [0, 1, 1]] }
];

let board = [];
let current = null;
let score = 0;
let gameOver = false;
let timer = null;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const matrix = cloneMatrix(shape.matrix);

  return {
    type: shape.type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0
  };
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]).reverse());
}

function collides(matrix, offsetX, offsetY) {
  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (!matrix[row][col]) {
        continue;
      }

      const x = offsetX + col;
      const y = offsetY + row;

      if (x < 0 || x >= COLS || y >= ROWS) {
        return true;
      }

      if (y >= 0 && board[y][x]) {
        return true;
      }
    }
  }

  return false;
}

function mergePiece() {
  for (let row = 0; row < current.matrix.length; row += 1) {
    for (let col = 0; col < current.matrix[row].length; col += 1) {
      if (!current.matrix[row][col]) {
        continue;
      }

      const x = current.x + col;
      const y = current.y + row;

      if (y >= 0) {
        board[y][x] = current.type;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;

  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row].every(Boolean)) {
      board.splice(row, 1);
      board.unshift(Array(COLS).fill(""));
      cleared += 1;
      row += 1;
    }
  }

  if (cleared > 0) {
    score += cleared * 100;
  }
}

function spawnPiece() {
  current = randomPiece();

  if (collides(current.matrix, current.x, current.y)) {
    gameOver = true;
    stopLoop();
  }
}

function lockPiece() {
  mergePiece();
  clearLines();
  spawnPiece();
}

function drop() {
  if (gameOver) {
    return;
  }

  if (!collides(current.matrix, current.x, current.y + 1)) {
    current.y += 1;
  } else {
    lockPiece();
  }
}

function hardDrop() {
  if (gameOver) {
    return;
  }

  while (!collides(current.matrix, current.x, current.y + 1)) {
    current.y += 1;
  }

  lockPiece();
}

function move(deltaX) {
  if (gameOver) {
    return;
  }

  const nextX = current.x + deltaX;
  if (!collides(current.matrix, nextX, current.y)) {
    current.x = nextX;
  }
}

function rotate() {
  if (gameOver) {
    return;
  }

  const rotated = rotateMatrix(current.matrix);

  if (!collides(rotated, current.x, current.y)) {
    current.matrix = rotated;
    return;
  }

  if (!collides(rotated, current.x - 1, current.y)) {
    current.x -= 1;
    current.matrix = rotated;
    return;
  }

  if (!collides(rotated, current.x + 1, current.y)) {
    current.x += 1;
    current.matrix = rotated;
  }
}

function renderCell(value) {
  return value ? COLORS[value] : COLORS.empty;
}

function boardWithCurrentPiece() {
  const snapshot = board.map((row) => [...row]);

  if (!current) {
    return snapshot;
  }

  for (let row = 0; row < current.matrix.length; row += 1) {
    for (let col = 0; col < current.matrix[row].length; col += 1) {
      if (!current.matrix[row][col]) {
        continue;
      }

      const x = current.x + col;
      const y = current.y + row;

      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        snapshot[y][x] = current.type;
      }
    }
  }

  return snapshot;
}

function render() {
  const snapshot = boardWithCurrentPiece();
  const topBorder = `+${"-".repeat(COLS * 2)}+`;
  const rows = snapshot.map((row) => `|${row.map(renderCell).join("")}|`);

  const sidebar = [
    "Simple Terminal Tetris",
    "",
    `Score: ${score}`,
    "",
    "Controls:",
    "A / D or Left / Right: Move",
    "W or Up: Rotate",
    "S or Down: Soft drop",
    "Space: Hard drop",
    "R: Restart",
    "Q: Quit"
  ];

  if (gameOver) {
    sidebar.push("", "Game Over", "Press R to play again");
  }

  process.stdout.write("\x1b[2J\x1b[H");
  process.stdout.write("\x1b[?25l");

  const maxLines = Math.max(rows.length + 2, sidebar.length);

  for (let i = 0; i < maxLines; i += 1) {
    let left = "";

    if (i === 0) {
      left = topBorder;
    } else if (i === rows.length + 1) {
      left = topBorder;
    } else if (i > 0 && i <= rows.length) {
      left = rows[i - 1];
    }

    const right = sidebar[i] ?? "";
    process.stdout.write(`${left.padEnd(COLS * 2 + 4)}  ${right}\n`);
  }
}

function stopLoop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startLoop() {
  stopLoop();
  timer = setInterval(() => {
    drop();
    render();
  }, DROP_INTERVAL);
}

function resetGame() {
  board = createBoard();
  score = 0;
  gameOver = false;
  spawnPiece();
  render();
  startLoop();
}

function cleanupAndExit() {
  stopLoop();
  process.stdout.write("\x1b[?25h\x1b[0m\n");

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();
  process.exit(0);
}

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on("keypress", (_, key) => {
  if (!key) {
    return;
  }

  if (key.ctrl && key.name === "c") {
    cleanupAndExit();
    return;
  }

  if (key.name === "q") {
    cleanupAndExit();
    return;
  }

  if (key.name === "r") {
    resetGame();
    return;
  }

  if (key.name === "left" || key.name === "a") {
    move(-1);
  } else if (key.name === "right" || key.name === "d") {
    move(1);
  } else if (key.name === "down" || key.name === "s") {
    drop();
  } else if (key.name === "up" || key.name === "w") {
    rotate();
  } else if (key.name === "space") {
    hardDrop();
  }

  render();
});

process.on("SIGINT", cleanupAndExit);
process.on("SIGTERM", cleanupAndExit);

resetGame();
