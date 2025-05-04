export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const createStage = () =>
    Array.from(Array(BOARD_HEIGHT), () =>
        new Array(BOARD_WIDTH).fill([0, 'clear']) // [0 represents no tetromino, 'clear' means no collision]
    );

export const TETROMINOS = {
    0: { shape: [[0]], color: '0, 0, 0' }, // Represents an empty cell
    I: {
        shape: [
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0]
        ],
        color: '80, 227, 230', // Cyan
    },
    J: {
        shape: [
            [0, 'J', 0],
            [0, 'J', 0],
            ['J', 'J', 0]
        ],
        color: '36, 95, 223', // Blue
    },
    L: {
        shape: [
            [0, 'L', 0],
            [0, 'L', 0],
            [0, 'L', 'L']
        ],
        color: '223, 173, 36', // Orange
    },
    O: {
        shape: [
            ['O', 'O'],
            ['O', 'O']
        ],
        color: '223, 217, 36', // Yellow
    },
    S: {
        shape: [
            [0, 'S', 'S'],
            ['S', 'S', 0],
            [0, 0, 0]
        ],
        color: '48, 211, 56', // Green
    },
    T: {
        shape: [
            ['T', 'T', 'T'],
            [0, 'T', 0],
            [0, 0, 0]
        ],
        color: '132, 61, 198', // Purple
    },
    Z: {
        shape: [
            ['Z', 'Z', 0],
            [0, 'Z', 'Z'],
            [0, 0, 0]
        ],
        color: '227, 78, 78', // Red
    },
};

export const randomTetromino = () => {
    const tetrominos = 'IJLOSTZ';
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return TETROMINOS[randTetromino];
};

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
            // 1. Check that we're on an actual Tetromino cell
            if (player.tetromino[y][x] !== 0) {
                // 2. Check that our move is inside the game areas height (y)
                // We shouldn't go through the bottom of the play area
                if (!stage[y + player.pos.y + moveY] ||
                    // 3. Check that our move is inside the game areas width (x)
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    // 4. Check that the cell we're moving to isn't set to clear
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
                ) {
                    return true; // Collision detected
                }
            }
        }
    }
    // 5. If everything above is false
    return false; // No collision
}; 