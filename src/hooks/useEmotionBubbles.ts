import { useEffect, useRef } from 'react';
import type { NurturingStats, CharacterCondition, Poop } from '../types/nurturing';
import type { EmotionCategory } from '../types/emotion';

interface UseEmotionBubblesProps {
    stats: NurturingStats;
    condition: CharacterCondition;
    poops: Poop[];
    showBubble: (category: EmotionCategory, level: 1 | 2 | 3) => void;
    bubble: { category: EmotionCategory; level: 1 | 2 | 3; key: number } | null;
}

export const useEmotionBubbles = ({
    stats,
    condition,
    poops,
    showBubble,
    bubble,
}: UseEmotionBubblesProps) => {
    const lastBubbleTimeRef = useRef(0);

    useEffect(() => {
        const checkAndShowBubble = () => {
            const now = Date.now();
            const timeSinceLastBubble = now - lastBubbleTimeRef.current;

            // Don't show bubble if one was shown recently (less than 8 seconds ago)
            if (timeSinceLastBubble < 8000) {
                return;
            }

            // Don't show bubble if currently showing one
            if (bubble !== null) {
                return;
            }

            const { happiness, health, fullness } = stats;

            // ==================== 위급 상태 (Critical) ====================

            // 1. 매우 위급: 건강 20 미만 (즉시 치료 필요)
            if (health < 20) {
                showBubble('sick', 3);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 2. 위급: 아픔 상태 + 건강 50 미만
            if (condition.isSick && health < 50) {
                showBubble('sick', 2);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 3. 매우 배고픔: 포만감 10 미만 (즉시 먹이 필요)
            if (fullness < 10) {
                showBubble('worried', 3);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 4. 배고픔: 배고픔 상태 + 포만감 30 미만
            if (condition.isHungry && fullness < 30) {
                showBubble('worried', 2);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 5. 똥이 많을 때 (3개 이상)
            if (poops.length >= 3) {
                showBubble('worried', 3);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 6. 똥이 있을 때 (1-2개)
            if (poops.length > 0) {
                showBubble('worried', 1);
                lastBubbleTimeRef.current = now;
                return;
            }

            // ==================== 불만족 상태 (Unhappy) ====================

            // 7. 매우 불행: 행복도 20 미만
            if (happiness < 20) {
                showBubble('worried', 3);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 8. 약간 불행: 행복도 40 미만
            if (happiness < 40) {
                showBubble('worried', 1);
                lastBubbleTimeRef.current = now;
                return;
            }

            // ==================== 주의 상태 (Warning) ====================

            // 9. 약한 질병: 아픔 상태 (건강은 50 이상)
            if (condition.isSick) {
                showBubble('sick', 1);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 10. 약간 배고픔: 포만감 50 미만
            if (fullness < 50) {
                showBubble('neutral', 2);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 11. 약간 피곤함: 행복도 60 미만
            if (happiness < 60) {
                showBubble('neutral', 1);
                lastBubbleTimeRef.current = now;
                return;
            }

            // ==================== 만족 상태 (Satisfied) ====================

            // 12. 매우 행복: 모든 스탯이 높음
            if (happiness > 85 && fullness > 70 && health > 80) {
                showBubble('joy', 3);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 14. 행복: 주요 스탯이 높음
            if (happiness > 70 && fullness > 60 && health > 60) {
                showBubble('joy', 2);
                lastBubbleTimeRef.current = now;
                return;
            }

            // 15. 만족: 행복도 60 이상
            if (happiness > 60) {
                showBubble('joy', 1);
                lastBubbleTimeRef.current = now;
                return;
            }

            // ==================== 기본 상태 (Default) ====================
            showBubble('neutral', 1);
            lastBubbleTimeRef.current = now;
        };

        // Initial check after 2 seconds
        const initialTimeout = setTimeout(checkAndShowBubble, 2000);

        // Check every 10 seconds for periodic bubbles
        const bubbleInterval = setInterval(checkAndShowBubble, 10000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(bubbleInterval);
        };
    }, [stats, condition, poops, bubble, showBubble]); // Dependencies
};
