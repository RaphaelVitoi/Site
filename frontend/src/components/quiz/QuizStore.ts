/**
 * IDENTITY: Córtex de Estado SOTA v4.2 Gold (Zustand)
 * PATH: src/store/QuizStore.ts
 * ROLE: Gerenciamento Descentralizado da Árvore de Nash, Cenários ICM e Didática Visceral.
 */

import { create } from "zustand";

// === TIPOLOGIA SOTA ===

export interface IcmQuizNode {
  id: string;
  question: string;
  explanation: string;
  options: Array<{
    text: string;
    isOptimal: boolean;
    evLoss: number; // 0 para a linha GTO. Valores > 0 para punição.
  }>;
}

export interface IcmScenarioNode {
  id: string;
  slug: string;
  name: string;
  category: string;
  theory: string | null;
  verdict: string | null;
  stacks: number[];
  prizes: number[];
  ipPos: string;
  oopPos: string;
  ipRp: number;
  oopRp: number;
}

export type VisceralFeedbackType =
  | "idle"
  | "success_glow"
  | "flash_red"
  | "shake_fatal";

interface QuizState {
  // Malha de Dados (RAM)
  scenario: IcmScenarioNode | null;
  quizzes: IcmQuizNode[];

  // Estado Termodinâmico (Sessão Atual)
  currentQuizIndex: number;
  evLossAccumulated: number;
  correctAnswers: number;
  isCompleted: boolean;

  // Motores Sensoriais (Framer Motion Triggers)
  visceralFeedback: VisceralFeedbackType;

  // Ações Mutacionais (Fricção Zero)
  loadScenario: (scenario: IcmScenarioNode, quizzes: IcmQuizNode[]) => void;
  answerQuiz: (optionIndex: number) => void;
  nextQuiz: () => void;
  resetSession: () => void;
  clearFeedback: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  scenario: null,
  quizzes: [],
  currentQuizIndex: 0,
  evLossAccumulated: 0,
  correctAnswers: 0,
  isCompleted: false,
  visceralFeedback: "idle",

  loadScenario: (scenario: IcmScenarioNode, quizzes: IcmQuizNode[]) =>
    set({
      scenario,
      quizzes,
      currentQuizIndex: 0,
      evLossAccumulated: 0,
      correctAnswers: 0,
      isCompleted: false,
      visceralFeedback: "idle",
    }),

  answerQuiz: (optionIndex: number) => {
    const state = get();
    const currentQuiz = state.quizzes[state.currentQuizIndex];
    if (!currentQuiz) return;

    const selectedOption = currentQuiz.options[optionIndex];
    if (!selectedOption) return;

    const isCorrect = selectedOption.isOptimal;
    const evLoss = selectedOption.evLoss;

    // Lógica SOTA de Didática Visceral (Punição Proporcional ao Erro)
    let feedback: VisceralFeedbackType;
    if (isCorrect) {
      feedback = "success_glow";
    } else if (evLoss > 0.5) {
      feedback = "shake_fatal"; // EV Loss > 0.5bb causa tremor estrutural na UI
    } else {
      feedback = "flash_red";
    }

    set({
      evLossAccumulated: state.evLossAccumulated + evLoss,
      correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
      visceralFeedback: feedback,
    });
  },

  nextQuiz: () =>
    set((state: QuizState) => {
      const nextIndex = state.currentQuizIndex + 1;
      return {
        currentQuizIndex: nextIndex,
        isCompleted: nextIndex >= state.quizzes.length,
        visceralFeedback: "idle",
      };
    }),

  resetSession: () =>
    set({
      currentQuizIndex: 0,
      evLossAccumulated: 0,
      correctAnswers: 0,
      isCompleted: false,
      visceralFeedback: "idle",
    }),

  clearFeedback: () => set({ visceralFeedback: "idle" }),
}));
