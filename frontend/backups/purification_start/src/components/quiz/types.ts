import { TelemetryCategorySchema } from "@/lib/schemas";

/**
 * IDENTITY: Tipos do sistema de Quiz ICM
 * PATH: src/components/quiz/types.ts
 * ROLE: Interfaces TypeScript para o motor de quiz e seus componentes.
 */

export type TelemetryCategory =
  (typeof TelemetryCategorySchema.enum)[keyof typeof TelemetryCategorySchema.enum];

const TELEMETRY_CATEGORY_SET = new Set<string>(TelemetryCategorySchema.options);

export function resolveTelemetryCategory(
  category?: string,
): TelemetryCategory {
  if (category && TELEMETRY_CATEGORY_SET.has(category)) {
    return category as TelemetryCategory;
  }

  return "simulator";
}

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
  /** Categoria tematica (ex: "Bolha", "Risk Premium") usada para analytics */
  category?: TelemetryCategory;
  /** Perda de EV associada ao erro usada para analytics */
  evLoss?: number;
}
