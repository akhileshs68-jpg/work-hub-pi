import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught rendering error caught by Work Hub Pi chassis:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn('Failed to clear localStorage on error reset:', e);
    }
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-slate-950 border border-red-500/25 rounded-3xl p-8 space-y-6 shadow-2xl shadow-red-950/20">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-red-500/20 animate-pulse">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Interface Rescue Guard
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected user interface rendering issue was caught by the sandbox runtime chassis. Let's restore the view safely.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-950/20 border border-red-500/10 rounded-2xl p-4 text-left max-h-40 overflow-y-auto font-mono text-[11px] text-red-300 leading-relaxed scrollbar-thin">
                <p className="font-bold text-red-400 mb-1">{this.state.error.name}: {this.state.error.message}</p>
                <p className="text-[10px] text-slate-500 font-medium whitespace-pre-wrap leading-tight">{this.state.error.stack}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/10 active:scale-98 cursor-pointer"
              >
                Reset Store & Reload
              </button>
              
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-semibold rounded-2xl text-[11px] transition-all cursor-pointer"
              >
                Attempt Instant Retry
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-medium">
              Work Hub Pi Sandbox Security Guard Active
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
