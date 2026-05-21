"use client";

import { useEffect, useState } from "react";

export interface Step {
  id: string;
  targetId: string;
  title: string;
  content: string;
  scenarioId?: string;
  autoFlags?: { payjump?: boolean; blinds?: boolean };
  openDetails?: boolean;
}

const TOUR_STEPS: Step[] = [
  {
    id: "anchor",
    targetId: "anchor-aula12",
    title: "A Gênese: Âncora Aula 1.2",
    content:
      "Todo o motor SOTA é alimentado por estes dados empíricos. Aqui você vê a realidade de uma mesa final real calculada em alta resolução.",
    openDetails: true,
  },
  {
    id: "vacuum",
    targetId: "scenario-chipev",
    title: "O Referencial Zero (ChipEV)",
    content:
      "No vácuo matemático, a utilidade é linear. É o ponto de controle para você entender como a estratégia básica funciona sem pressões externas.",
    scenarioId: "chipev",
  },
  {
    id: "snapshot",
    targetId: "scenario-icmev-puro",
    title: "A Fotografia (ICMev Estático)",
    content:
      "O ICM tradicional reconhece o risco, mas ignora o tempo. Note como os ranges já se contraem, mas de forma rígida e cega ao relógio.",
    scenarioId: "icmev-puro",
  },
  {
    id: "quantum",
    targetId: "quantum-controls",
    title: "O Salto Quântico (SOTA)",
    content:
      'Agora ligamos o fluxo do tempo. Ative o "Payjump Iminente" para ver como a Perspectiva Matemática força decisões que o ICM tradicional não consegue explicar.',
    scenarioId: "paradoxo",
    autoFlags: { payjump: true },
  },
];

interface SimulatorTourProps {
  onStepAction: (step: Step) => void;
  onClose: () => void;
}

export default function SimulatorTour({
  onStepAction,
  onClose,
}: Readonly<SimulatorTourProps>) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("sota_tour_seen");
    if (!hasSeenTour) {
      setTimeout(() => {
        setVisible(true);
        setActiveStep(0);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (activeStep !== null && visible) {
      const nextStep = TOUR_STEPS[activeStep];
      if (nextStep) {
        onStepAction(nextStep);
      }
    }
  }, [activeStep, visible, onStepAction]);

  const nextStep = () => {
    if (activeStep !== null && activeStep < TOUR_STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      localStorage.setItem("sota_tour_seen", "true");
      setVisible(false);
      onClose();
    }
  };

  if (!visible || activeStep === null) return null;

  const step = TOUR_STEPS[activeStep];
  if (!step) return null;

  return (
    <>
      <style>{`
        .tour-spotlight {
          position: fixed;
          pointer-events: none;
          z-index: 9998;
          border: 2px solid var(--accent-indigo);
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes pulseIndigo {
          0% { box-shadow: 0 0 0 0px rgba(99, 102, 241, 0.4); }
          100% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
        }
        .pulse-border {
          animation: pulseIndigo 2s infinite;
        }
      `}</style>

      <div
        {...{
          style: {
            position: "fixed",
            bottom: "2.5rem",
            right: "2.5rem",
            zIndex: 10000,
            width: "320px",
            background: "rgba(10, 15, 30, 0.95)",
            backdropFilter: "blur(25px)",
            border: "1px solid rgba(99, 102, 241, 0.5)",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
            animation: "slideIn 0.5s ease-out",
          },
        }}
      >
        <div
          {...{
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.2rem",
            },
          }}
        >
          <span
            {...{
              style: {
                fontSize: "0.55rem",
                fontWeight: 900,
                color: "var(--accent-indigo-light)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              },
            }}
          >
            Tutorial Ontológico &middot; {activeStep + 1}/{TOUR_STEPS.length}
          </span>
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            {...{
              style: {
                background: "none",
                border: "none",
                color: "var(--text-darker)",
                cursor: "pointer",
                fontSize: "1.2rem",
              },
            }}
          >
            &times;
          </button>
        </div>

        <h4
          {...{
            style: {
              margin: "0 0 0.75rem",
              fontSize: "1rem",
              color: "var(--text-main)",
              fontWeight: 900,
            },
          }}
        >
          {step.title}
        </h4>
        <p
          {...{
            style: {
              margin: "0 0 1.5rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
            },
          }}
        >
          {step.content}
        </p>

        <button
          onClick={nextStep}
          {...{
            style: {
              width: "100%",
              padding: "0.8rem",
              background:
                "linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-indigo-dark) 100%)",
              border: "none",
              borderRadius: "10px",
              color: "var(--text-main)",
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
            },
          }}
        >
          {activeStep === TOUR_STEPS.length - 1
            ? "Iniciar Exploração"
            : "Próximo"}
        </button>
      </div>
    </>
  );
}
