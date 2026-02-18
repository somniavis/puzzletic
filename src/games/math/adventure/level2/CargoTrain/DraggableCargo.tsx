import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './styles.module.css';

interface DraggableCargoProps {
    id: string;
    value: number;
    disabled?: boolean;
}

export const DraggableCargo: React.FC<DraggableCargoProps> = React.memo(({ id, value, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { value },
        disabled: disabled,
    });

    const clearFocus = (e: React.SyntheticEvent<HTMLButtonElement>) => {
        e.currentTarget.blur();
    };

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1, // Visual feedback during drag
        touchAction: 'none', // Crucial for mobile drag
        zIndex: isDragging ? 100 : 1, // Ensure it floats above everything
    };

    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`${styles.optionBtn} ${isDragging ? styles.optionBtnDragging : ''}`}
            disabled={disabled}
            onPointerUp={clearFocus}
            onPointerCancel={clearFocus}
            onMouseUp={clearFocus}
            onTouchEnd={clearFocus}
            onClick={(e) => e.preventDefault()}
        >
            {value}
        </button>
    );
});

DraggableCargo.displayName = 'DraggableCargo';
