import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout0 } from '../../../layouts/Layout0';
import { useTenFrameCountLogic } from './GameLogic';
import manifest_en from './locales/en';
import './TenFrameCount.css';
import type { GameManifest } from '../../../types';

interface TenFrameCountProps {
    onExit: () => void;
}

export const TenFrameCount: React.FC<TenFrameCountProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const logic = useTenFrameCountLogic();
    const {
        targetNumber,
        options,
        emoji,
        handleAnswer
    } = logic;

    // Load Translations
    useEffect(() => {
        const newResources = { en: { translation: { games: { 'ten-frame-count': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    const layoutEngine = {
        ...logic,
        onExit: onExit,
        difficultyLevel: 1, // Fixed for now or dynamic based on round? Logic handles internal difficulty.
        maxLevel: 1
    };

    return (
        <Layout0
            title={t('games.ten-frame-count.title')}
            subtitle={t('games.ten-frame-count.subtitle')}
            gameId="ten-frame-count"
            engine={layoutEngine as any}
            instructions={[
                { icon: '👀', title: t('games.ten-frame-count.howToPlay.step1.title'), description: t('games.ten-frame-count.howToPlay.step1.desc') },
                { icon: '🔢', title: t('games.ten-frame-count.howToPlay.step2.title'), description: t('games.ten-frame-count.howToPlay.step2.desc') },
            ]}
            onExit={onExit}
        >
            <div className="math-grid-container">
                {/* Grid Display */}
                {/* Grid Display */}
                <div className="grid-display-area">
                    <div className="ten-frame-container">
                        {Array.from({ length: Math.ceil(targetNumber / 10) }).map((_, rowIndex) => {
                            const remainingItems = targetNumber - (rowIndex * 10);
                            const countInRow = Math.min(10, remainingItems);

                            return (
                                <div
                                    key={`${targetNumber}-${rowIndex}`}
                                    className="ten-frame-row"
                                    style={{ animationDelay: `${rowIndex * 0.15}s` }}
                                >
                                    {/* Always render 10 slots to show the frame structure */}
                                    {Array.from({ length: 10 }).map((_, colIndex) => {
                                        const isFilled = colIndex < countInRow;
                                        return (
                                            <div key={colIndex} className={`grid-item ${!isFilled ? 'empty' : ''}`}>
                                                {isFilled ? emoji : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Question */}
                <div className="question-prompt">
                    {t('games.ten-frame-count.question', { item: emoji })}
                </div>

                {/* Answer Options */}
                <div className="options-grid">
                    {options.map((option) => (
                        <button
                            key={option} // Unique key to reset state/focus on change
                            className="option-btn"
                            onClick={() => handleAnswer(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </Layout0>
    );
};

export const manifest: GameManifest = {
    id: 'ten-frame-count',
    title: 'Ten-Frame Count',
    titleKey: 'games.ten-frame-count.title',
    subtitle: 'Group counting practice',
    subtitleKey: 'games.ten-frame-count.subtitle',
    description: 'Count the items by looking at rows of 10. Master place values!',
    descriptionKey: 'games.ten-frame-count.desc',
    category: 'math',
    level: 2, // First Level 2 Game
    component: TenFrameCount,
    thumbnail: '🔢'
};
