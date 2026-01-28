import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            const isChunkError = this.state.error?.name === 'ChunkLoadError' ||
                (this.state.error?.message && /Loading chunk|undefined/i.test(this.state.error.message));

            return (
                <div style={{
                    height: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    color: '#1e293b',
                    gap: '1.5rem'
                }}>
                    <div style={{ fontSize: '4rem' }}>🔧</div>

                    {isChunkError ? (
                        <>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>새로운 업데이트가 있어요!</h2>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                                최신 버전을 불러오기 위해 새로고침해 주세요.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>오류가 발생했습니다</h2>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                                죄송합니다. 앱을 실행하는 도중 문제가 생겼습니다.
                            </p>

                            {/* Debug Info */}
                            <details style={{ marginTop: '1rem', padding: '1rem', background: '#e2e8f0', borderRadius: '8px', width: '100%', maxWidth: '300px', textAlign: 'left', overflow: 'auto' }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>오류 상세 정보</summary>
                                <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                                    {this.state.error?.toString()}
                                </pre>
                            </details>
                        </>
                    )}

                    <button
                        onClick={this.handleReload}
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'white',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        🔄 다시 시작하기
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
