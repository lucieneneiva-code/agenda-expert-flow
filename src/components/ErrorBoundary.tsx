import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-background p-8">
            <div className="text-center">
              <h2 className="text-lg font-bold text-card-foreground mb-2">Algo deu errado</h2>
              <p className="text-muted-foreground mb-4">Ocorreu um erro inesperado.</p>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.history.back();
                }}
                className="rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Voltar
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
