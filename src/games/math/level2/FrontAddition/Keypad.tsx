import React from 'react';

interface KeypadProps {
    onInput: (key: string) => void;
    disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onInput, disabled }) => {
    // Layout requested:
    // 1 2 3 4 5 AC
    // 6 7 8 9 0 CHECK
    const keys = [
        '1', '2', '3', '4', '5', 'AC',
        '6', '7', '8', '9', '0', 'CHECK'
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)', // 6 columns
            gap: '8px',
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            padding: '12px',
            backgroundColor: '#dbeafe', // Blue-100 (More visible)
            borderRadius: '24px',
            border: 'none',
            borderBottom: '6px solid #bfdbfe', // 3D Bottom Shadow Effect (Blue-200)
            fontSize: 'inherit'
        }}>
            {keys.map(key => {
                let bgColor = '#ffffff';
                let textColor = '#334155'; // slate-700
                let borderColor = '#e2e8f0';

                if (key === 'CHECK') {
                    bgColor = '#3b82f6'; // blue-500 (Primary Action)
                    textColor = '#ffffff';
                    borderColor = '#2563eb';
                } else if (key === 'AC') {
                    bgColor = '#94a3b8'; // slate-400 (Secondary Action)
                    textColor = '#ffffff';
                    borderColor = '#64748b';
                }

                return (
                    <button
                        key={key}
                        onClick={() => onInput(key)}
                        disabled={disabled}
                        style={{
                            height: '48px',
                            borderRadius: '12px', // Slightly more rounded buttons
                            border: `1px solid ${borderColor}`,
                            backgroundColor: bgColor,
                            color: textColor,
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            boxShadow: `0 2px 0 ${key === 'CHECK' || key === 'AC' ? 'rgba(0,0,0,0.1)' : '#cbd5e1'}`, // Subtle shadow
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.7 : 1,
                            transition: 'transform 0.1s active',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            width: '100%'
                        }}
                        onMouseDown={(e) => {
                            if (!disabled) e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseUp={(e) => {
                            if (!disabled) e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled) e.currentTarget.style.transform = 'scale(1)';
                        }}
                        className="keypad-btn"
                    >
                        {key === 'CHECK' ? '✓' : key}
                    </button>
                );
            })}
        </div>
    );
};
