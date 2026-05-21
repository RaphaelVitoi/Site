"use client";

import React from "react";
import { logTelemetryEvent } from "@/lib/telemetry-client";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to our telemetry service
    logTelemetryEvent({
      category: "error",
      componentName: "ErrorBoundary",
      metadata: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });

    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          {...{
            style: {
              padding: "2rem",
              margin: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: "rgba(225, 29, 72, 0.1)",
              border: "1px solid rgba(225, 29, 72, 0.2)",
              color: "var(--text-bright)",
              fontFamily: "monospace",
            },
          }}
        >
          <h2
            {...{
              style: {
                color: "var(--accent-rose)",
                fontSize: "1.2rem",
                marginBottom: "1rem",
              },
            }}
          >
            <i
              className="fa-solid fa-triangle-exclamation"
              {...{ style: { marginRight: "0.5rem" } }}
            ></i>{" "}
            Anomalia Detectada no Motor ICM
          </h2>
          <p
            {...{
              style: {
                marginBottom: "1rem",
                fontSize: "0.9rem",
                color: "var(--text-light)",
              },
            }}
          >
            A termodinâmica do simulador sofreu uma falha crítica. A equipe SOTA
            já foi notificada através do sistema de telemetria.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            {...{
              style: {
                padding: "0.5rem 1rem",
                backgroundColor: "rgba(244, 63, 94, 0.2)",
                border: "1px solid rgba(244, 63, 94, 0.5)",
                borderRadius: "0.25rem",
                color: "var(--accent-danger-light)",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "all 0.2s",
              },
            }}
          >
            <i
              className="fa-solid fa-rotate-right"
              {...{ style: { marginRight: "0.5rem" } }}
            ></i>{" "}
            Reiniciar Subsistema
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
