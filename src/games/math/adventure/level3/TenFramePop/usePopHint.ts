import React from 'react';

interface UsePopHintParams {
    gameState: string;
    isFirstProblem: boolean;
    hasRows: boolean;
    visibleMs: number;
    exitMs: number;
}

export const usePopHint = ({
    gameState,
    isFirstProblem,
    hasRows,
    visibleMs,
    exitMs
}: UsePopHintParams) => {
    const [showPopHint, setShowPopHint] = React.useState(false);
    const [isPopHintExiting, setIsPopHintExiting] = React.useState(false);
    const hasShownPopHintRef = React.useRef(false);
    const popHintTimerRef = React.useRef<number | null>(null);
    const popHintExitTimerRef = React.useRef<number | null>(null);

    const clearHintTimers = React.useCallback(() => {
        if (popHintTimerRef.current != null) {
            window.clearTimeout(popHintTimerRef.current);
            popHintTimerRef.current = null;
        }
        if (popHintExitTimerRef.current != null) {
            window.clearTimeout(popHintExitTimerRef.current);
            popHintExitTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        return () => {
            clearHintTimers();
        };
    }, [clearHintTimers]);

    React.useEffect(() => {
        if (gameState !== 'idle' && gameState !== 'gameover') return;
        clearHintTimers();
        setShowPopHint(false);
        setIsPopHintExiting(false);
        hasShownPopHintRef.current = false;
    }, [clearHintTimers, gameState]);

    React.useEffect(() => {
        if (gameState !== 'playing' || !hasRows || !isFirstProblem || hasShownPopHintRef.current) return;

        hasShownPopHintRef.current = true;
        setShowPopHint(true);
        setIsPopHintExiting(false);

        popHintTimerRef.current = window.setTimeout(() => {
            setIsPopHintExiting(true);
            popHintExitTimerRef.current = window.setTimeout(() => {
                setShowPopHint(false);
                setIsPopHintExiting(false);
                popHintExitTimerRef.current = null;
            }, exitMs);
            popHintTimerRef.current = null;
        }, visibleMs);

        return () => {
            clearHintTimers();
        };
    }, [clearHintTimers, exitMs, gameState, hasRows, isFirstProblem, visibleMs]);

    return {
        showPopHint,
        isPopHintExiting
    };
};
