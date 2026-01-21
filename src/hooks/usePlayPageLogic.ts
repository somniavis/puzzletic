import { useState, useMemo } from 'react';
import type { GameCategory } from '../games/types';
import { GAMES } from '../games/registry';
import type { GameScoreValue } from '../types/nurturing';
import { parseGameScore } from '../utils/progression';

export type MathMode = 'adventure' | 'genius';
export type Operator = 'ADD' | 'SUB' | 'MUL' | 'DIV';

export interface UsePlayPageLogicProps {
    gameScores?: Record<string, GameScoreValue>;
}

export const usePlayPageLogic = ({ gameScores }: UsePlayPageLogicProps) => {
    // -- State --
    const [activeTab, setActiveTab] = useState<GameCategory>(() => {
        return (sessionStorage.getItem('play_tab') as GameCategory) || 'math';
    });

    const [mathMode, setMathMode] = useState<MathMode>(() => {
        return (sessionStorage.getItem('play_math_mode') as MathMode) || 'adventure';
    });

    const [selectedOp, setSelectedOp] = useState<Operator>('ADD');

    // -- Handlers --
    const handleTabSelect = (category: GameCategory) => {
        setActiveTab(category);
        sessionStorage.setItem('play_tab', category);
    };

    const handleMathModeSelect = (mode: MathMode) => {
        setMathMode(mode);
        sessionStorage.setItem('play_math_mode', mode);
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
