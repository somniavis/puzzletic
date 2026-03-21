import { useMemo } from 'react';
import type { GameCategory } from '../games/types';
import { GAMES } from '../games/registry';
import type { GameScoreValue } from '../types/nurturing';
import { parseGameScore } from '../utils/progression';
import type { PlayMathMode, PlayOperator } from '../services/playUiPreferencesService';

export type MathMode = PlayMathMode;
export type Operator = PlayOperator;

export interface UsePlayPageLogicProps {
    gameScores?: Record<string, GameScoreValue>;
    activeTab: GameCategory;
    mathMode: MathMode;
    selectedOp: Operator;
    onActiveTabChange: (category: GameCategory) => void;
    onMathModeChange: (mode: MathMode) => void;
    onSelectedOpChange: (op: Operator) => void;
}

export const usePlayPageLogic = ({
    gameScores,
    activeTab,
    mathMode,
    selectedOp,
    onActiveTabChange,
    onMathModeChange,
    onSelectedOpChange,
}: UsePlayPageLogicProps) => {
    // -- Handlers --
    const handleTabSelect = (category: GameCategory) => {
        onActiveTabChange(category);
    };

    const handleMathModeSelect = (mode: MathMode) => {
        onMathModeChange(mode);
    };

    const setSelectedOp = (op: Operator) => {
        onSelectedOpChange(op);
    };

    // -- Data Filtering --
    const adventureGames = useMemo(() => {
        return GAMES.filter(g => g.category === activeTab && g.mode !== 'genius')
            .sort((a, b) => a.level - b.level);
    }, [activeTab]);

    const drillGames = useMemo(() => {
        if (activeTab !== 'math') return [];
        return GAMES.filter(g => g.category === 'math' && g.mode === 'genius');
    }, [activeTab]);

    const filteredDrills = useMemo(() => {
        if (selectedOp === 'ADD') return drillGames.filter(g => g.id.includes('front-addition'));
        if (selectedOp === 'SUB') return drillGames.filter(g => g.id.includes('front-subtraction'));
        if (selectedOp === 'MUL') return drillGames.filter(g => g.id.includes('back-multiplication'));
        if (selectedOp === 'DIV') return drillGames.filter(g => g.id.includes('division')); // Placeholder for future
        return [];
    }, [drillGames, selectedOp]);

    // Drill Stats (using compact gameScores format)
    const drillStats = useMemo(() => {
        const total = filteredDrills.length;
        const completed = filteredDrills.filter(g => {
            const { clearCount } = parseGameScore(gameScores?.[g.id]);
            // Considered "completed" if played at least once
            return clearCount > 0;
        }).length;
        return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
    }, [filteredDrills, gameScores]);

    return {
        activeTab,
        mathMode,
        selectedOp,
        setSelectedOp,
        adventureGames,
        drillGames,
        filteredDrills,
        drillStats,
        handleTabSelect,
        handleMathModeSelect
    };
};
