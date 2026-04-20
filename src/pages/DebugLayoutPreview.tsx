import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout1 } from '../games/layouts/Standard/Layout1';
import { Layout2 } from '../games/layouts/Standard/Layout2';
import { Layout3 } from '../games/layouts/Standard/Layout3';
import { useGameEngine } from '../games/layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../components/Game/PowerUpBtn';
import { PortalMathBackground } from '../components/common/PortalMathBackground';

export const DebugLayoutPreview: React.FC = () => {
    const navigate = useNavigate();
    const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(3);

    // Initialize real engine to test responsiveness
    const engine = useGameEngine({ initialLives: 2, initialTime: 45 });

    // Mock Params
    const commonProps = {
        title: `Layout ${currentLayout} Preview`,
        subtitle: "Debug Mode",
        description: "This is a preview of the standardized game layout. Use this to verify UI consistency.",
        instructions: [
            { icon: '👆', title: 'Tap', description: 'Tap the correct answer' },
            { icon: '⚡', title: 'Fast', description: 'Answer quickly for bonus' }
        ],
        onExit: () => navigate('/admin'), // Return to admin console
        engine: engine
    };

    // Mock PowerUps for Layout 2 & 3
    const [debugPowerUps, setDebugPowerUps] = useState({ freeze: 0, life: 0, double: 0 });

    const mockPowerUps: PowerUpBtnProps[] = [
        {
            count: debugPowerUps.freeze,
            color: 'blue',
            icon: '❄️',
            title: 'Freeze Time',
            onClick: () => alert('Freeze Time Triggered'),
            disabledConfig: false,
            status: 'normal'
        },
        {
            count: debugPowerUps.life,
            color: 'red',
            icon: '❤️',
            title: 'Extra Life',
            onClick: () => { },
            disabledConfig: true,
            status: 'normal'
        },
        {
            count: debugPowerUps.double,
            color: 'yellow',
            icon: '⚡',
            title: 'Double Score',
            onClick: () => alert('Double Score Triggered'),
            disabledConfig: false,
            status: 'normal'
        }
    ];

    // Debug Controls to Add PowerUps
    const DebugControls = () => (
        <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '1rem',
            display: 'flex', gap: '8px', alignItems: 'center'
        }}>
            <span style={{ color: 'white', marginRight: '8px', fontSize: '0.8rem' }}>Debug Add:</span>
            <button onClick={() => setDebugPowerUps(p => ({ ...p, freeze: p.freeze + 1 }))} style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', color: 'white', padding: '4px 8px' }}>❄️ +1</button>
            <button onClick={() => setDebugPowerUps(p => ({ ...p, life: p.life + 1 }))} style={{ background: '#ef4444', border: 'none', borderRadius: '4px', color: 'white', padding: '4px 8px' }}>❤️ +1</button>
            <button onClick={() => setDebugPowerUps(p => ({ ...p, double: p.double + 1 }))} style={{ background: '#eab308', border: 'none', borderRadius: '4px', color: 'white', padding: '4px 8px' }}>⚡ +1</button>
        </div>
    );

    // Layout Switcher UI
    const Switcher = () => (
        <div style={{
            position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '1rem',
            display: 'flex', gap: '8px'
        }}>
            {[1, 2, 3].map((num) => (
                <button
                    key={num}
                    onClick={() => setCurrentLayout(num as 1 | 2 | 3)}
                    style={{
                        padding: '8px 16px',
                        background: currentLayout === num ? '#3b82f6' : '#374151',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'
                    }}
                >
                    Layout {num}
                </button>
            ))}
        </div>
    );

    // Mock Content
    const MockGameContent = () => (
        <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #cbd5e1', borderRadius: '1rem', background: 'rgba(255,255,255,0.5)'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Game Area</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="game-btn shadow-md bg-white p-4 rounded-xl text-xl font-bold">Option A</button>
                <button className="game-btn shadow-md bg-white p-4 rounded-xl text-xl font-bold">Option B</button>
                <button className="game-btn shadow-md bg-white p-4 rounded-xl text-xl font-bold">Option C</button>
                <button className="game-btn shadow-md bg-white p-4 rounded-xl text-xl font-bold">Option D</button>
            </div>
        </div>
    );

    // Unified background for debug preview, matching the portal math theme
    const unifiedBackground = (
        <PortalMathBackground />
    );

    // Render Correct Layout
    const renderLayout = () => {
        switch (currentLayout) {
            case 1:
                return (
                    <Layout1
                        {...commonProps}
                        background={unifiedBackground}
                    >
                        <MockGameContent />
                    </Layout1>
                );
            case 2:
                return (
                    <Layout2
                        {...commonProps}
                        powerUps={mockPowerUps}
                        background={unifiedBackground}
                    >
                        <MockGameContent />
                    </Layout2>
                );
            case 3:
                return (
                    <Layout3
                        {...commonProps}
                        powerUps={mockPowerUps}
                        target={{ value: 10, icon: '🎯', label: 'Make 10' }}
                        background={unifiedBackground}
                    >
                        <MockGameContent />
                    </Layout3>
                );
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <Switcher />
            {renderLayout()}
            {(currentLayout === 2 || currentLayout === 3) && <DebugControls />}
        </div>
    );
};
