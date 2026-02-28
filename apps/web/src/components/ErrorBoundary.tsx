import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-background px-6"
          role="alert"
        >
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" aria-hidden="true" />
            <h1 className="font-display text-display-sm text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-body-md text-muted-foreground mb-6">
              An unexpected error occurred. Please try again or return to the homepage.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={this.handleReset} variant="default" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
              <Link to="/">
                <Button variant="outline" size="lg">
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
