import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNurturing } from '../contexts/NurturingContext';
import './AdminConsolePage.css';

const tools = [
    {
        title: 'Character Gallery',
        description: 'Review evolution stages and species cards in one place.',
        to: '/admin/gallery',
    },
    {
        title: 'Layout Preview',
        description: 'Inspect standardized game layout templates outside the player UI.',
        to: '/admin/layouts',
    },
    {
        title: 'Debug Stats',
        description: 'Open the stat and animation sandbox for internal verification.',
        to: '/admin/stats',
    },
];

export const AdminConsolePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { gro, xp, addRewards, maxStats, debugAddStars, debugUnlockAllGames } = useNurturing();
    const isIndex = location.pathname === '/admin';
    const debugActionsEnabled = import.meta.env.DEV;

    return (
        <div className="admin-console-page">
            <header className="admin-console-header">
                <div>
                    <p className="admin-console-kicker">Admin Console</p>
                    <h1>Internal tools only</h1>
                    <p className="admin-console-subtitle">
                        Moved out of the player-facing UI and grouped for review and operations.
                    </p>
                </div>
                <div className="admin-console-header-actions">
                    <span className="admin-console-identity">{user?.email ?? 'Admin'}</span>
                    <button type="button" className="admin-console-close" onClick={() => navigate('/room')}>
                        Back to Room
                    </button>
                </div>
            </header>

            <nav className="admin-console-nav" aria-label="Admin navigation">
                <Link className={`admin-console-link ${location.pathname === '/admin' ? 'active' : ''}`} to="/admin">
                    Dashboard
                </Link>
                <Link className={`admin-console-link ${location.pathname.startsWith('/admin/gallery') ? 'active' : ''}`} to="/admin/gallery">
                    Gallery
                </Link>
                <Link className={`admin-console-link ${location.pathname.startsWith('/admin/layouts') ? 'active' : ''}`} to="/admin/layouts">
                    Layouts
                </Link>
                <Link className={`admin-console-link ${location.pathname.startsWith('/admin/stats') ? 'active' : ''}`} to="/admin/stats">
                    Stats
                </Link>
            </nav>

            {isIndex ? (
                <main className="admin-console-home">
                    <section className="admin-console-panel">
                        <h2>Current migration scope</h2>
                        <ul className="admin-console-list">
                            <li>Profile page debug panel removed from the player UI.</li>
                            <li>Character gallery and debug layout preview are now admin-routed tools.</li>
                            <li>Admin access is temporarily gated by `VITE_ADMIN_EMAILS`.</li>
                        </ul>
                    </section>

                    <section className="admin-console-grid">
                        {tools.map((tool) => (
                            <Link key={tool.to} className="admin-tool-card" to={tool.to}>
                                <h3>{tool.title}</h3>
                                <p>{tool.description}</p>
                                <span>Open tool</span>
                            </Link>
                        ))}
                    </section>

                    <section className="admin-console-panel">
                        <h2>Debug actions</h2>
                        <p className="admin-console-note">
                            Current state: GRO {gro} / XP {xp}
                        </p>
                        {!debugActionsEnabled && (
                            <p className="admin-console-note">
                                Debug mutation actions are disabled outside development builds.
                            </p>
                        )}
                        <div className="admin-console-actions">
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => {
                                    addRewards(0, 150);
                                    window.alert(`Added 150 GRO. New total: ${gro + 150}`);
                                }}
                                disabled={!debugActionsEnabled}
                            >
                                +150 GRO
                            </button>
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => {
                                    addRewards(500, 0);
                                    window.alert(`Added 500 XP. New total: ${xp + 500}`);
                                }}
                                disabled={!debugActionsEnabled}
                            >
                                +500 XP
                            </button>
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => {
                                    debugAddStars(1001);
                                }}
                                disabled={!debugActionsEnabled}
                            >
                                +1001 Stars
                            </button>
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => {
                                    const result = maxStats();
                                    window.alert(result.message);
                                }}
                                disabled={!debugActionsEnabled}
                            >
                                Max Stats
                            </button>
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => navigate('/admin/layouts')}
                            >
                                Layout Preview
                            </button>
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => {
                                    localStorage.setItem('FORCE_TRAIN', 'true');
                                    window.alert('Train queued. Return to Pet Room to verify it.');
                                }}
                                disabled={!debugActionsEnabled}
                            >
                                Call Train
                            </button>
                            <button
                                type="button"
                                className="admin-console-button"
                                onClick={() => {
                                    if (window.confirm('Unlock all games for testing?')) {
                                        debugUnlockAllGames();
                                    }
                                }}
                                disabled={!debugActionsEnabled}
                            >
                                Unlock All
                            </button>
                        </div>
                    </section>
                </main>
            ) : (
                <main className="admin-console-content">
                    <Outlet />
                </main>
            )}
        </div>
    );
};

export default AdminConsolePage;
