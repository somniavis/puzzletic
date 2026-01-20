import React from 'react';

interface GeniusDashboardProps {
    completedCount: number;
    totalCount: number;
    percentage: number;
}

export const GeniusDashboard: React.FC<GeniusDashboardProps> = ({
    completedCount,
    totalCount,
    percentage
}) => {
    return (
        <div className="stats-dashboard">
            <div className="stats-glow"></div>
            <div className="stats-content">
                <div className="stats-label">Drill Progress</div>
                <div className="stats-value-box">
                    <h3 className="stats-big-num">{completedCount}</h3>
                    <span className="stats-total">/ {totalCount} levels</span>
                </div>
            </div>
            {/* Circular Progress (Simple CSS/SVG) */}
            <div style={{ position: 'relative', width: '4rem', height: '4rem' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="5" fill="none" />
                    <circle
                        cx="32" cy="32" r="28"
                        stroke="#818cf8" strokeWidth="5" fill="none"
                        strokeDasharray={176}
                        strokeDashoffset={176 - (176 * percentage) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '900' }}>
                    {Math.round(percentage)}%
                </div>
            </div>
        </div>
    );
};
