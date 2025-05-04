import React from 'react';
import Cell from './Cell';

// Styled components can be used for styling
// import { StyledBoard } from './styles/StyledBoard';

// Board dimensions (could be imported from helpers)
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Updated styles
const boardStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
    // gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`, // Let height be determined by container
    gridGap: '1px',
    border: '2px solid #333',
    // Let the container define max size, board fills it
    width: 'auto', // Adjust width automatically based on height and aspect ratio
    height: '90vh', // Use most of the viewport height
    aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
    background: '#111',
};

const Board = ({ board }) => {
    return (
        <div style={boardStyle}> {/* Replace with <StyledBoard> later */}
            {board.map(row =>
                row.map((cell, x) => <Cell key={x} type={cell[0]} />)
            )}
        </div>
    );
};

export default Board; 