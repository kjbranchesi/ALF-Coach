import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; onError?: (e: Error) => void }
interface State { hasError: boolean }

export class SafeBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SafeBoundary]', error, info);
    this.props.onError?.(error);
  }
  render() { return this.state.hasError ? null : this.props.children; }
}

export default SafeBoundary;

