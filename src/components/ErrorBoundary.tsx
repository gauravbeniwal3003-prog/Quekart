import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/shop';
    } catch (_) {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 font-sans" id="error-boundary-view">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Something Went Wrong</h1>
              <p className="text-sm font-semibold text-slate-500 leading-normal">
                QueKart encountered a runtime rendering exception.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Error Details</div>
              <div className="text-xs font-bold text-slate-700 font-mono break-all leading-normal max-h-36 overflow-y-auto">
                {this.state.error?.toString() || 'Unknown Error'}
              </div>
              {this.state.errorInfo?.componentStack && (
                <div className="text-[10px] font-mono text-slate-400 max-h-24 overflow-y-auto mt-2 leading-relaxed whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full h-11 rounded-xl bg-[#143C6B] hover:bg-[#0C2340] text-white text-sm font-black tracking-wide shadow-xs transition-all cursor-pointer active:scale-[0.99]"
                id="error-reload-btn"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold tracking-wide transition-all cursor-pointer active:scale-[0.99]"
                id="error-reset-btn"
              >
                Clear Data & Force Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

