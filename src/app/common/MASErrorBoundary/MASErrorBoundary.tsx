import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UnexpectedError } from './UnexpectedError';
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class MASErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('error:', error, errorInfo);
  }

  updateState = (hasError: boolean) => {
    this.setState({ hasError });
  };

  render() {
    if (this.state.hasError) {
      return <UnexpectedError updateState={this.updateState} />;
    }
    return this.props.children;
  }
}

export { MASErrorBoundary };
