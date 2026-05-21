import { z } from "zod";

/**
 * Isomorfismo SOTA v6.2.1 GOLD: Zod Schemas.
 * Paridade absoluta com shared/types/schemas.py (Pydantic).
 */

export const SOTAMetricsSchema = z.object({
  esperanca: z.number().describe("Vetor de ganho esperado (PM)"),
  expectativa: z.number().describe("Vetor bruto de EV"),
  perspectiva: z.number().describe("Expectativa ajustada por risco RIO"),
  ci: z.number().describe("Coeficiente de Insolvencia"),
  is_solvent: z.boolean(),
  is_actionable: z.boolean(),
});

export type SOTAMetrics = z.infer<typeof SOTAMetricsSchema>;

export const RAGQuerySchema = z.object({
  query: z.string(),
  top_k: z.number().default(5),
  threshold: z.number().default(0.75),
  metadata_filter: z.record(z.any()).optional(),
});

export type RAGQuery = z.infer<typeof RAGQuerySchema>;

export const LLMConfigSchema = z.object({
  vram_limit_gb: z.number().default(12),
  ram_reserve_gb: z.number().default(4),
  gpu_layers: z.number().default(32),
  context_window: z.number().default(8192),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

export const ResourceUsageSchema = z.object({
  ram: z.object({
    total: z.number(),
    available: z.number(),
    percent: z.number(),
  }),
  vram: z.object({
    total: z.number(),
    allocated: z.number(),
    reserved: z.number(),
    free: z.number(),
  }).or(z.object({ error: z.string() })),
  is_healthy: z.boolean(),
});

export type ResourceUsage = z.infer<typeof ResourceUsageSchema>;
