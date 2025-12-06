import React from 'react';

interface Props {
    onExit: () => void;
}

export const NumberMatch: React.FC<Props> = ({ onExit }) => {
    return (
        <div style={{
            height: '100%',
            width: '100%',
            background: '#fff',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            <button
                onClick={onExit}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    fontSize: '1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                🔙 Exit
            </button>

            <h2>Number Match Game</h2>
            <p>Level 1 Math Game Placeholder</p>
            <div style={{ fontSize: '5rem', margin: '50px' }}>
                1 + 1 = ?
            </div>

            <div style={{ marginTop: '20px' }}>
                {/* Placeholder for game interaction */}
                <button style={{ padding: '10px 20px', fontSize: '1.2rem' }}>2</button>
            </div>
        </div>
    );
};
