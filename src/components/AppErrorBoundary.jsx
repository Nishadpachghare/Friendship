import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App runtime error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink text-parchment flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-gold/20">
            <p className="text-xs tracking-[0.35em] text-ash mb-2 uppercase">
              Something broke
            </p>
            <h1 className="font-display text-3xl text-gold mb-3">
              We can recover this
            </h1>
            <p className="text-sm text-parchment/75 mb-6">
              The page hit an unexpected error. Your saved memories are still
              safe.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-gold hover:bg-gold-light text-ink font-semibold rounded-full px-6 py-2.5 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
