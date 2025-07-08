// Maze settings

const ROWS = 15;
const COLS = 21;

let maze = [];
let player = { row: 0, col: 0 };
let exit = { row: ROWS - 1, col: COLS - 1 };
let level = 1;
let monster = { row: 0, col: 0 };
let monsterInterval = null;

function generateMaze(rows, cols) {
    // Initialize maze with walls
    let maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    // Recursive backtracking
    function carve(r, c) {
        const dirs = [
            [0, 2], [0, -2], [2, 0], [-2, 0]
        ];
        shuffle(dirs);
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 1) {
                maze[nr][nc] = 0;
                maze[r + dr / 2][c + dc / 2] = 0;
                carve(nr, nc);
            }
        }
    }
    // Start at (0,0)
    maze[0][0] = 0;
    carve(0, 0);
    return maze;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function renderMaze() {
    const container = document.getElementById('maze-container');
    container.innerHTML = '';
    const stickFigureSVG = `<svg width="24" height="28" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="6" r="4" stroke="#222" stroke-width="1.5" fill="#fff"/>
        <circle cx="10.7" cy="5.5" r="0.4" fill="#222"/>
        <circle cx="13.3" cy="5.5" r="0.4" fill="#222"/>
        <line x1="12" y1="10" x2="12" y2="20" stroke="#222" stroke-width="2"/>
        <line x1="12" y1="14" x2="6" y2="18" stroke="#222" stroke-width="2"/>
        <line x1="12" y1="14" x2="18" y2="18" stroke="#222" stroke-width="2"/>
        <line x1="12" y1="20" x2="7" y2="26" stroke="#222" stroke-width="2"/>
        <line x1="12" y1="20" x2="17" y2="26" stroke="#222" stroke-width="2"/>
    </svg>`;
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'maze-row';
        for (let c = 0; c < COLS; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'maze-cell';
            if (maze[r][c] === 1) cellDiv.classList.add('wall');
            if (r === player.row && c === player.col) {
                cellDiv.classList.add('player');
                cellDiv.innerHTML = stickFigureSVG;
            } else if (r === monster.row && c === monster.col) {
                cellDiv.classList.add('monster');
                cellDiv.textContent = '*';
            } else if (r === exit.row && c === exit.col) {
                cellDiv.classList.add('exit');
                cellDiv.textContent = '+';
            }
            rowDiv.appendChild(cellDiv);
        }
        container.appendChild(rowDiv);
    }
    // Update level display
    const levelDisplay = document.getElementById('level-display') || document.getElementById('levelDisplay');
    if (levelDisplay) {
        levelDisplay.textContent = 'Level: ' + level;
    }
}

function movePlayer(dr, dc) {
    const nr = player.row + dr;
    const nc = player.col + dc;
    if (
        nr >= 0 && nr < ROWS &&
        nc >= 0 && nc < COLS &&
        maze[nr][nc] === 0
    ) {
        player.row = nr;
        player.col = nc;
        // Check collision with monster
        if (player.row === monster.row && player.col === monster.col) {
            gameOver();
            return;
        }
        renderMaze();
        if (player.row === exit.row && player.col === exit.col) {
            // Player reached exit: increase level, start new maze
            setTimeout(() => {
                level++;
                startGame();
            }, 200);
        }
    }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': movePlayer(-1, 0); break;
        case 'ArrowDown': case 's': case 'S': movePlayer(1, 0); break;
        case 'ArrowLeft': case 'a': case 'A': movePlayer(0, -1); break;
        case 'ArrowRight': case 'd': case 'D': movePlayer(0, 1); break;
    }
});

function placeMonster() {
    // Find all open cells not at player or exit
    let openCells = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (maze[r][c] === 0 && !(r === player.row && c === player.col) && !(r === exit.row && c === exit.col)) {
                openCells.push({ row: r, col: c });
            }
        }
    }
    const idx = Math.floor(Math.random() * openCells.length);
    monster = { ...openCells[idx] };
}

function monsterCanSeePlayer() {
    // Same row
    if (monster.row === player.row) {
        let minC = Math.min(monster.col, player.col);
        let maxC = Math.max(monster.col, player.col);
        for (let c = minC + 1; c < maxC; c++) {
            if (maze[monster.row][c] === 1) return false;
        }
        return true;
    }
    // Same col
    if (monster.col === player.col) {
        let minR = Math.min(monster.row, player.row);
        let maxR = Math.max(monster.row, player.row);
        for (let r = minR + 1; r < maxR; r++) {
            if (maze[r][monster.col] === 1) return false;
        }
        return true;
    }
    return false;
}

function moveMonster() {
    if (player.row === monster.row && player.col === monster.col) {
        gameOver();
        return;
    }
    let moved = false;
    if (monsterCanSeePlayer()) {
        // Move toward player
        let dr = player.row - monster.row;
        let dc = player.col - monster.col;
        let stepR = dr === 0 ? 0 : dr / Math.abs(dr);
        let stepC = dc === 0 ? 0 : dc / Math.abs(dc);
        // Prefer row move if not already aligned
        if (stepR !== 0 && maze[monster.row + stepR][monster.col] === 0) {
            monster.row += stepR;
            moved = true;
        } else if (stepC !== 0 && maze[monster.row][monster.col + stepC] === 0) {
            monster.col += stepC;
            moved = true;
        }
    }
    if (!moved) {
        // Move randomly to adjacent open cell
        const dirs = [ [0,1], [1,0], [0,-1], [-1,0] ];
        shuffle(dirs);
        for (const [dr, dc] of dirs) {
            const nr = monster.row + dr;
            const nc = monster.col + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && maze[nr][nc] === 0 && !(nr === player.row && nc === player.col)) {
                monster.row = nr;
                monster.col = nc;
                break;
            }
        }
    }
    // Check collision after move
    if (player.row === monster.row && player.col === monster.col) {
        gameOver();
        return;
    }
    renderMaze();
}

function gameOver() {
    clearInterval(monsterInterval);
    alert('Game Over! The monster got you.');
    level = 1;
    startGame();
}



function startGame() {
    if (monsterInterval) clearInterval(monsterInterval);
    maze = generateMaze(ROWS, COLS);
    player = { row: 0, col: 0 };
    exit = { row: ROWS - 1, col: COLS - 1 };
    maze[exit.row][exit.col] = 0; // Ensure exit is open
    placeMonster();
    renderMaze();
    monsterInterval = setInterval(moveMonster, 500);
}

startGame();
