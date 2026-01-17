import React from 'react';
import { calculateMastery } from '../utils/resultMetrics';
import './MasteryBar.css';

interface MasteryBarProps {
    playCount: number;
    totalScore: number;
    compact?: boolean;
}

export const MasteryBar: React.FC<MasteryBarProps> = ({ playCount, totalScore, compact = false }) => {
    const mastery = calculateMastery({ playCount, totalScore, highScore: 0, lastPlayedAt: 0 });
    const { percent, label } = mastery;

    return (
        <div className="mastery-container">
            {!compact && (
                <div className="mastery-header">
                    <span>{label}</span>
                    <span>{percent}%</span>
                </div>
            )}

            <div className="mastery-track">
                <div
                    className="mastery-fill"
                    style={{
                        width: `${percent}%`,
                        backgroundColor: percent >= 100 ? '#FFD700' : '#4CAF50' // Green while growing, Gold when done
                    }}
                />
            </div>
        </div>
    );
};
