import React from 'react';

type State = {
  hasError: boolean;
  message?: string;
  stack?: string;
};

/**
 * ErrorBoundary: Catches rendering errors in Canvas components.
 * Improvements:
 * - Better error display with stack trace option
 * - Reset capability
 * - TypeScript strict mode compatible
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return {
      hasError: true,
      message: err.message,
      stack: err.stack,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for debugging
    console.error('Canvas rendering error:', error, info);

    // TODO: Send to telemetry service in production
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, info);
    // }
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined, stack: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-red-600 rounded-xl border border-red-300 bg-red-50">
          <div className="font-semibold mb-2">Something went wrong rendering this slide</div>
          <p className="text-red-700 mb-3">
            Try switching templates or undoing the last change.
          </p>
          {this.state.message && (
            <div className="mt-2 p-2 text-xs text-red-800 bg-red-100 rounded font-mono">
              {this.state.message}
            </div>
          )}
          {process.env.NODE_ENV === 'development' && this.state.stack && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-red-700 hover:text-red-900">
                Stack trace
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-[10px]">
                {this.state.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
