/**
 * IDENTITY: Tipos do sistema de Quiz ICM
 * PATH: src/components/quiz/types.ts
 * ROLE: Interfaces TypeScript para o motor de quiz e seus componentes.
 */

/** Opcao individual de resposta */
export interface QuizOption {
  id: string;
  label: string;
}

/** Questao completa do quiz */
export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  /** Categoria tematica (ex: "Bolha", "Risk Premium") — usado para analytics */
  category?: string;
  /** Perda de EV associada ao erro — usado para analytics */
  evLoss?: number;
}
