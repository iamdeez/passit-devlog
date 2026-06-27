import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-sm w-full card p-8 text-center" role="alert" aria-live="assertive">
            <span className="material-symbols-outlined text-error text-6xl mb-4 block"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <h1 className="text-2xl font-display font-bold text-on-surface mb-3">앗! 문제가 발생했어요</h1>
            <p className="text-sm text-on-surface-variant mb-6">
              예상치 못한 오류가 발생했습니다.<br />
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="p-3 mb-4 bg-surface-container rounded-xl text-left max-h-48 overflow-auto">
                <pre className="text-xs text-on-surface-variant whitespace-pre-wrap break-words font-mono">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={this.handleReload} className="btn-primary">
                <span className="material-symbols-outlined text-base">refresh</span>
                페이지 새로고침
              </button>
              <button onClick={this.handleReset} className="btn-outlined">다시 시도</button>
            </div>

            <p className="text-xs text-on-surface-variant mt-4">문제가 계속되면 고객지원팀에 문의해주세요.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
