import React from 'react';
import { TETROMINOS } from '../../gameHelpers';

// Basic cell styling - modified slightly
const cellBaseStyle = {
    width: 'auto',
    aspectRatio: '1 / 1',
    // Background color will be set dynamically
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)' // Slightly darker border
};

const Cell = ({ type }) => {
    const color = TETROMINOS[type].color;
    const dynamicStyle = {
        ...cellBaseStyle,
        // Use the color from TETROMINOS
        backgroundColor: `rgba(${color}, 0.8)`,
        // Add border color based on the tetromino type
        borderBottomColor: `rgba(${color}, 0.1)`,
        borderRightColor: `rgba(${color}, 1)`,
        borderTopColor: `rgba(${color}, 1)`,
        borderLeftColor: `rgba(${color}, 0.3)`,
    };

    return (
        <div style={dynamicStyle}>
            {/* We can remove the comment now */}
        </div>
    );
};

// Use React.memo to avoid unnecessary re-renders of cells that haven't changed
export default React.memo(Cell); 