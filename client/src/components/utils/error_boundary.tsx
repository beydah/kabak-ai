import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload(); // Simple reload for now
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center text-center gap-3">
                    <AlertCircle className="text-red-500" size={32} />
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-secondary max-w-xs">
                        {this.state.error?.message || "An unexpected error occurred in this component."}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
