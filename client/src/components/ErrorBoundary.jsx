import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Clear storage to prevent stale session loops
    try {
      sessionStorage.removeItem('hostel_current_view');
      sessionStorage.removeItem('hostel_auth_user');
      sessionStorage.removeItem('hostel_auth_role');
      localStorage.setItem('hostel_current_view', 'home');
      localStorage.removeItem('hostel_auth_user');
      localStorage.removeItem('hostel_auth_role');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060911] p-6">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#0d121f] border border-red-200 dark:border-red-900 p-8 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {this.state.error?.message || 'An unexpected error occurred while rendering the dashboard.'}
            </p>
            {this.state.errorInfo && (
              <details className="text-left text-xs text-slate-400 bg-slate-50 dark:bg-[#060911] p-3 rounded-lg border border-slate-200 dark:border-slate-800 max-h-32 overflow-auto">
                <summary className="cursor-pointer font-semibold mb-1">Error Details</summary>
                <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
            >
              Reset & Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
