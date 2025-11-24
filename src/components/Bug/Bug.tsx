import React, { useMemo, useState } from 'react';
import type { Bug as BugType } from '../../types/nurturing';
import './Bug.css';

interface BugProps {
  bug: BugType;
  onClick: (bugId: string) => void;
}

export const Bug: React.FC<BugProps> = ({ bug, onClick }) => {
  const [isBeingSwatted, setIsBeingSwatted] = useState(false);

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
    if (isBeingSwatted) return;

    setIsBeingSwatted(true);

    // 애니메이션 후 제거
    setTimeout(() => {
      onClick(bug.id);
    }, 500); // 애니메이션 duration과 맞춤
  };

  // 각 벌레의 애니메이션 시작 시간을 랜덤화하여 동기화를 방지
  const animationStyle = useMemo(() => {
    const delay = -(Math.random() * 8); // 애니메이션 주기는 8초
    return {
      animationDelay: `${delay.toFixed(2)}s`,
    };
  }, []);

  return (
    <>
      {/* 신문지 이펙트 */}
      {isBeingSwatted && (
        <div
          className="newspaper-effect"
          style={{
            left: `${bug.x}%`,
            bottom: `${bug.y}%`,
          }}
        >
          🗞️
        </div>
      )}

      <div
        className={`bug ${isBeingSwatted ? 'bug-swatted' : ''}`}
        style={{
          left: `${bug.x}%`,
          bottom: `${bug.y}%`,
        }}
        onClick={handleClick}
        title="클릭해서 잡기"
      >
        <span
          className={`bug-emoji bug-${bug.type}`}
          style={animationStyle}
        >
          {getBugEmoji(bug.type)}
        </span>
      </div>
    </>
  );
};

export default Bug;
