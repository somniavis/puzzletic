import React, { useState, useEffect } from 'react';
import { Layout1 } from '../../../layouts/Layout1';
import { useGameEngine } from '../../../layouts/Layout1/useGameEngine';
import { useTranslation } from 'react-i18next';
import en from './locales/en';

interface Props {
    onExit: () => void;
}


export const NumberMatch: React.FC<Props> = ({ onExit }) => {
    const { t, i18n } = useTranslation();

    // Inject translations dynamically
    useEffect(() => {
        i18n.addResourceBundle('en', 'math-01', en, true, true);
        // Cleanup is optional but good practice if memory is tight, though usually we keep cache
    }, [i18n]);

    // 1. Initialize Game Engine
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 60,
        maxDifficulty: 5
    });

    // 2. Local Game Logic (The "Content")
    const [problem, setProblem] = useState<{ q: string, a: number } | null>(null);

    // Generate problem when game starts or answers submitted
    useEffect(() => {
        if (engine.gameState === 'playing' && !problem) {
            generateNextProblem();
        }
    }, [engine.gameState, problem]);

    // Reset problem on game over/idle
    useEffect(() => {
        if (engine.gameState === 'idle') {
            setProblem(null);
        }
    }, [engine.gameState]);

    const generateNextProblem = () => {
        const level = engine.difficultyLevel;
        const num1 = Math.floor(Math.random() * (level * 5)) + 1;
        const num2 = Math.floor(Math.random() * (level * 5)) + 1;
        setProblem({ q: `${num1} + ${num2} = ?`, a: num1 + num2 });
    };

    const handleAnswer = (num: number) => {
        if (!problem) return;
        const isCorrect = num === problem.a;
        engine.submitAnswer(isCorrect);

        // Prepare next problem slightly delayed to sync with engine state
        if (isCorrect) {
            setTimeout(() => {
                setProblem(null); // Will trigger effect to generate new one
            }, 1000);
        } else {
            // Retain problem if wrong? or new one? 
            // Sample logic usually generates new one.
            setTimeout(() => {
                setProblem(null);
            }, 1000);
        }
    };

    // Mock Options for the game UI
    const generateOptions = () => {
        if (!problem) return [];
        const correct = problem.a;
        const options = new Set<number>([correct]);
        while (options.size < 4) {
            options.add(correct + Math.floor(Math.random() * 10) - 5);
        }
        return Array.from(options).sort((a, b) => a - b);
    };

    return (
        <Layout1
            title={t('games.math-01.title')}
            subtitle={t('games.math-01.sub')}
            description={t('math-01:instruction', { target: problem?.a || '?' })}
            instructions={[
                { icon: '🎯', title: t('games.math-01.howToPlay.goal.title'), description: t('games.math-01.howToPlay.goal.desc') },
                { icon: '⏳', title: t('games.math-01.howToPlay.time.title'), description: t('games.math-01.howToPlay.time.desc') },
                { icon: '❤️', title: t('games.math-01.howToPlay.lives.title'), description: t('games.math-01.howToPlay.lives.desc') }
            ]}
            engine={engine}
            onExit={onExit}
        >
            <div style={{ textAlign: 'center', width: '100%' }}>
                {problem && (
                    <>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1e293b' }}>
                            {problem.q}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {generateOptions().map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    style={{
                                        padding: '1.5rem',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        borderRadius: '1rem',
                                        border: 'none',
                                        background: 'white',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        color: '#334155',
                                        transition: 'transform 0.1s'
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout1>
    );
};
