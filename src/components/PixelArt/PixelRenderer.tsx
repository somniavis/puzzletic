import React from 'react';

export type PixelColor = string | null; // null = transparent

export interface PixelArtProps {
  pixels: PixelColor[][];
  pixelSize?: number;
  className?: string;
  onClick?: () => void;
}

export const PixelRenderer: React.FC<PixelArtProps> = ({
  pixels,
  pixelSize = 8,
  className = '',
  onClick,
}) => {
  const height = pixels.length;
  const width = pixels[0]?.length || 0;
  const containerWidth = width * pixelSize;
  const containerHeight = height * pixelSize;

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${height}, ${pixelSize}px)`,
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        imageRendering: 'pixelated',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {pixels.map((row, y) =>
        row.map((color, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color || 'transparent',
            }}
          />
        ))
      )}
    </div>
  );
};

export default PixelRenderer;