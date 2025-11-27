import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" role="alert">
          <h2>Что-то пошло не так</h2>
          <p>{this.state.error?.message || "Неизвестная ошибка"}</p>
          <button className="btn-outline" onClick={this.handleReset}>
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
