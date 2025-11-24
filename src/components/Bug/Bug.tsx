import React from 'react';
import type { Bug as BugType } from '../../types/nurturing';
import './Bug.css';

interface BugProps {
  bug: BugType;
  onClick: (bugId: string) => void;
}

export const Bug: React.FC<BugProps> = ({ bug, onClick }) => {
  const getBugEmoji = (type: BugType['type']): string => {
    switch (type) {
      case 'fly':
        return '🪰';
      case 'mosquito':
        return '🦟';
      default:
        return '🦟';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(bug.id);
  };

  return (
    <div
      className="bug"
      style={{
        left: `${bug.x}%`,
        bottom: `${bug.y}%`,
      }}
      onClick={handleClick}
    >
      <span className="bug-emoji">{getBugEmoji(bug.type)}</span>
    </div>
  );
};

export default Bug;
