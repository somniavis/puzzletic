import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

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
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>새로운 업데이트가 있어요!</h2>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                            최신 버전의 게임을 불러오기 위해<br />새로고침이 필요합니다.
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
                            🔄 새로고침
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
                    <h3>일시적인 오류가 발생했습니다.</h3>
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
                        다시 시도
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
