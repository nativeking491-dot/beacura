import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary] Caught:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    minHeight: "60vh", display: "flex", flexDirection: "column" as const,
                    alignItems: "center", justifyContent: "center", padding: "32px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center" as const,
                }}>
                    <div style={{
                        width: "64px", height: "64px", borderRadius: "16px",
                        background: "rgba(239,68,68,0.12)", display: "flex",
                        alignItems: "center", justifyContent: "center", marginBottom: "20px",
                        fontSize: "28px",
                    }}>
                        ⚠️
                    </div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                        Something went wrong
                    </h2>
                    <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", maxWidth: "360px" }}>
                        An unexpected error occurred. Your data is safe — this is just a display issue.
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: "10px 24px", borderRadius: "12px", border: "none",
                            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                            color: "white", fontWeight: 600, fontSize: "14px", cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                    {this.state.error && (
                        <details style={{ marginTop: "24px", fontSize: "12px", color: "#94a3b8", maxWidth: "400px" }}>
                            <summary style={{ cursor: "pointer" }}>Technical Details</summary>
                            <pre style={{ whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const, marginTop: "8px" }}>
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
