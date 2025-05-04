import React, { useState, useEffect } from 'react';

// Import helpers and components
import { createStage, checkCollision } from '../../gameHelpers';
import { randomTetromino, TETROMINOS } from '../../gameHelpers';
import Board from './Board';

// Styled components can be added later for better styling
// import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

// Custom Hook for game loop (recommended over setInterval directly)
import { useInterval } from '../../hooks/useInterval';
import { BOARD_WIDTH } from '../../gameHelpers'; // Need BOARD_WIDTH for resetPlayer

// Scoring
const linePoints = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines cleared

const Tetris = () => {
    const [dropTime, setDropTime] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // Pause state
    const [pausedDropTime, setPausedDropTime] = useState(null); // Store dropTime when paused

    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    const [stage, setStage] = useState(createStage());
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(0);

    const resetPlayer = () => {
        setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        });
    };

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer(prev => ({
            ...prev,
            pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
            collided,
        }))
    };

    const rotate = (matrix, dir) => {
        // Transpose rows and columns
        const rotatedTetromino = matrix.map((_, index) => matrix.map(col => col[index]));
        // Reverse each row to get the rotated matrix
        if (dir > 0) return rotatedTetromino.map(row => row.reverse()); // Clockwise
        return rotatedTetromino.reverse(); // Counter-clockwise
    };

    const rotatePlayer = (dir) => {
        if (player.collided) return;

        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        const initialPos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = initialPos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    const movePlayer = dir => {
        if (player.collided) return;
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0, collided: false });
        }
    };

    const dropPlayer = () => {
        if (player.collided || isPaused || gameOver) return; // Add checks
        setDropTime(null);
        drop();
    };

    // Helper function for sweeping rows (can be defined outside or inside useEffect/drop)
    const sweepRows = (stageToSweep) => {
        let clearedRowsCount = 0;
        const newStage = stageToSweep.reduce((ack, row) => {
            if (row.findIndex(cell => cell[0] === 0) === -1) {
                clearedRowsCount += 1;
                ack.unshift(new Array(stageToSweep[0].length).fill([0, 'clear']));
                return ack;
            }
            ack.push(row);
            return ack;
        }, []);
        return { stage: newStage, rowsClearedCount: clearedRowsCount };
    };

    const drop = () => {
        // Increase level based on rows cleared
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            // Update dropTime based on new level, only if not manually dropping or paused
            if (pausedDropTime === null) { // Avoid overriding paused time
                setDropTime(1000 / (level + 1 + 1) + 200); // Use level + 1 for calculation
            }
        }

        // Check for collision one step below
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            // No collision, move down
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Collision detected!

            // 1. Check for Game Over
            if (player.pos.y < 1) {
                console.log("GAME OVER!!!");
                setGameOver(true);
                setDropTime(null); // Stop the game loop
                return; // Exit drop function
            }

            // 2. Merge the piece into the stage
            const tempStage = stage.map(row =>
                row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        const stageY = y + player.pos.y;
                        const stageX = x + player.pos.x;
                        if (tempStage[stageY]?.[stageX]?.[1] === 'clear') {
                            tempStage[stageY][stageX] = [value, 'merged'];
                        }
                    }
                });
            });

            // 3. Sweep rows on the temporary stage
            const { stage: finalStage, rowsClearedCount } = sweepRows(tempStage);

            // 4. Update score and rows if lines were cleared
            if (rowsClearedCount > 0) {
                setScore(prev => prev + linePoints[rowsClearedCount - 1] * (level + 1));
                setRows(prev => prev + rowsClearedCount);
            }

            // 5. Update the main stage state
            setStage(finalStage);

            // 6. Reset player
            resetPlayer();

            // 7. Reset drop timer (consider pause state)
            const timeToSet = pausedDropTime !== null ? pausedDropTime : (1000 / (level + 1) + 200);
            setDropTime(timeToSet);
            // No need to manage pausedDropTime here, handled by pause toggle
        }
    }

    const startGame = () => {
        console.log("Starting game...");
        setStage(createStage());
        setDropTime(1000);
        resetPlayer();
        setGameOver(false);
        setIsPaused(false); // Reset pause state
        setPausedDropTime(null); // Clear paused time
        setScore(0);
        setRows(0);
        setLevel(0);
    }

    const togglePause = () => {
        if (gameOver) return; // Don't allow pause if game over

        if (isPaused) {
            setIsPaused(false);
            setDropTime(pausedDropTime); // Restore drop time
            setPausedDropTime(null);
        } else {
            setPausedDropTime(dropTime); // Store current drop time
            setIsPaused(true);
            setDropTime(null); // Stop the interval
        }
    };

    // Callback for key down events - Added Pause toggle and checks
    const handleKeyDown = (event) => {
        if (gameOver) return; // Ignore input if game over

        const { key } = event; // Destructure key
        const lowerKey = key.toLowerCase();

        if (lowerKey === ' ') { // Space bar for pause
            event.preventDefault(); // Prevent default space action (like button click)
            togglePause();
        } else if (!isPaused) { // Only handle game controls if not paused
            if (lowerKey === 'a') { movePlayer(-1); }
            else if (lowerKey === 'd') { movePlayer(1); }
            else if (lowerKey === 's') { dropPlayer(); }
            else if (lowerKey === 'q') { rotatePlayer(-1); }
            else if (lowerKey === 'e') { rotatePlayer(1); }
        }
    };

    // Release key handling - Reset dropTime when 's' is released (if not paused)
    const handleKeyUp = ({ key }) => {
        if (gameOver || isPaused) return; // Ignore if game over or paused

        if (key.toLowerCase() === 's') {
            if (dropTime === null && pausedDropTime === null) { // Ensure it wasn't paused
                setDropTime(1000 / (level + 1) + 200);
            }
        }
    };

    // Effect to handle key listeners - Simplified dependencies
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
        // Dependencies now only need functions directly called/affected by key events
        // and state that gates their execution (gameOver, isPaused, level, dropTime, pausedDropTime)
    }, [handleKeyDown, handleKeyUp, gameOver, isPaused, level, dropTime, pausedDropTime]);

    // Game loop using custom hook
    useInterval(() => {
        if (!gameOver && !isPaused) { // Check for pause
            drop();
        }
    }, dropTime); // Interval stops when dropTime is null (paused)

    console.log('re-render');

    // Create the stage that gets rendered (current stage + player)
    const stageToShow = stage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell)),
    );
    // Draw the player onto this temporary stage
    player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const stageY = y + player.pos.y;
                const stageX = x + player.pos.x;
                if (stageToShow[stageY] && stageToShow[stageY][stageX]) {
                    stageToShow[stageY][stageX] = [
                        value,
                        player.collided ? 'merged' : 'clear',
                    ];
                }
            }
        });
    });

    return (
        // Apply Flexbox styling for layout
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px', background: '#222', height: '100vh' }}>
            {/* Added position relative for absolute positioning of pause overlay */}
            <div style={{ position: 'relative' }}>
                <Board board={stageToShow} />
                {isPaused && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        background: 'rgba(0, 0, 0, 0.75)',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        fontSize: '1.5em',
                        fontWeight: 'bold',
                        zIndex: 10 // Ensure it's above the board
                    }}>
                        PAUSED
                    </div>
                )}
            </div>
            <aside style={{ marginLeft: '20px', color: 'white', border: '2px solid #333', padding: '10px', minWidth: '120px' }}>
                {gameOver ? (
                    // Display final stats on game over
                    <div>
                        <h3 style={{ color: 'red', fontWeight: 'bold' }}>Game Over</h3>
                        <p>Final Score: {score}</p>
                        <p>Final Rows: {rows}</p>
                        <p>Final Level: {level}</p>
                    </div>
                ) : (
                    <div>
                        <h3>Stats</h3>
                        <p>Score: {score}</p>
                        <p>Rows: {rows}</p>
                        <p>Level: {level}</p>
                        {/* Optionally show pause status here too */}
                        {isPaused && <p style={{ color: 'yellow', fontWeight: 'bold' }}>Paused</p>}
                    </div>
                )}
                <button onClick={startGame} style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }}>Start Game</button>
            </aside>
        </div>
    );
};

export default Tetris; 