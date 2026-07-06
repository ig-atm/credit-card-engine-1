import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: '#fff', height: '100vh', overflow: 'auto' }}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>Something went wrong.</h1>
          <details open style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>Click for error details</summary>
            <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc'}}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
