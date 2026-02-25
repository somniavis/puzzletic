import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import i18n from '../../i18n/config';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GameErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('GameErrorBoundary caught an error:', error, errorInfo);

        // Optional: Send to error reporting service
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Check if it's a chunk load error
            const isChunkError = this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
                this.state.error?.message?.includes('Importing a module script failed') ||
                this.state.error?.name === 'ChunkLoadError';

            if (isChunkError) {
                return (
                    <div className="game-error-container" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100dvh', // Use dvh for mobile
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        padding: '2rem',
                        textAlign: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{ fontSize: '3rem' }}>✨</div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                            {i18n.t('common.errorBoundary.updateTitle')}
                        </h2>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                            {i18n.t('common.errorBoundary.updateDesc')}
                        </p>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            🔄 {i18n.t('common.errorBoundary.refreshButton')}
                        </button>
                    </div>
                );
            }

            return this.props.fallback || (
                <div className="game-error-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#ef4444'
                }}>
                    <h3>{i18n.t('common.errorBoundary.tempErrorTitle')}</h3>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#e2e8f0',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        {i18n.t('common.errorBoundary.tempErrorRetry')}
                    </button>
                    {/* Debug: Show actual error */}
                    <details style={{ marginTop: '2rem', maxWidth: '80%', overflow: 'auto', textAlign: 'left', background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem' }}>
                        <summary style={{ cursor: 'pointer', color: '#64748b' }}>
                            {i18n.t('common.errorBoundary.errorDetailsTitle')}
                        </summary>
                        <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                            {this.state.error?.toString()}
                            <br />
                            {this.state.error?.stack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
