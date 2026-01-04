import React from 'react';
import { Coins, Flame, Heart, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
    score: number;
    lives: number;
    streak: number;
    timeLeft: number;
    className?: string;
}

export const GameLayoutDashboard: React.FC<DashboardProps> = ({
    score,
    lives,
    streak,
    timeLeft,
    className
}) => {
    const { t } = useTranslation();

    return (
        <div className={`layout1-dashboard ${className || ''}`}>
            {/* Reuse layout1-dashboard or renamed shared class */}
            <div className="stats-grid-row">
                <div className="stat-card score-card">
                    <div className="stat-label">{t('common.score')}</div>
                    <div className="stat-value"><Coins size={16} className="text-yellow-500" /> {score}</div>
                </div>
                <div className="stat-card lives-card">
                    <div className="stat-label">{t('common.lives')}</div>
                    <div className="stat-value">
                        {[...Array(3)].map((_, i) => (
                            <Heart key={i} size={16} fill={i < lives ? "#ef4444" : "none"} color={i < lives ? "#ef4444" : "#cbd5e1"} />
                        ))}
                    </div>
                </div>
                <div className="stat-card streak-card">
                    <div className="stat-label">{t('common.streak')}</div>
                    <div className="stat-value"><Flame size={16} className="text-orange-500" /> {streak}</div>
                </div>
                <div className="stat-card time-card">
                    <div className="stat-label">Time</div>
                    <div className="stat-value" style={{ color: timeLeft < 10 ? '#ef4444' : '#1e293b' }}>
                        <Clock size={16} /> {timeLeft}
                    </div>
                </div>
            </div>
        </div>
    );
};
