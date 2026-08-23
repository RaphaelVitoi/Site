/**
 * IDENTITY: Zod Schemas e Tipagens Isomórficas para o Motor PMev e Importadores de Solvers
 * PATH: frontend/src/schemas/perspective.ts
 * ROLE: Espelho estrito 1:1 dos modelos Pydantic v2 do Backend (Zero-Any).
 */

import { z } from 'zod';

export const SolverTypeSchema = z.enum([
  'deep_solver',
  'gtowizard',
  'monker_solver',
  'hrc_pro',
  'pio_solver',
  'auto',
]);
export type SolverType = z.infer<typeof SolverTypeSchema>;

export const PerspectiveCalculationRequestSchema = z.object({
  equity: z.number().min(0.0).max(1.0),
  realization_factor: z.number().min(0.1).max(2.5).default(1.0),
  valuation_stack: z.number().min(0.01).default(1.0),
  base_antes: z.number().min(0.0).default(1.0),
  time_to_blind_minutes: z.number().min(0.0).default(10.0),
  payjump_proximity_factor: z.number().min(0.0).max(1.0).default(0.5),
  position: z.string().default('BTN'),
  multiway_opponents: z.number().int().min(1).max(9).default(1),
  base_rio: z.number().min(0.0).default(0.0),
  stack_depth_bb: z.number().min(0.1).default(25.0),
  edge_base: z.number().min(0.0).default(0.05),
  aggression_factor: z.number().min(0.0).default(1.5),
  loss_aversion_base: z.number().min(1.0).default(2.25),
  pot_size: z.number().min(0.1).default(10.0),
  hero_invested: z.number().min(0.0).default(0.0),
});
export type PerspectiveCalculationRequest = z.infer<typeof PerspectiveCalculationRequestSchema>;

export const PerspectivaResultSchema = z.object({
  pmev: z.number(),
  dynamic_ev_fold: z.number(),
  structural_liability: z.number(),
  amortized_edge: z.number(),
  risk_advantage: z.number(),
  required_equity: z.number(),
  bubble_factor: z.number(),
  utility_win: z.number(),
  utility_lose: z.number(),
  optimal_action: z.enum(['FOLD', 'CALL', 'RAISE', 'BET', 'CHECK', 'ALLIN']).or(z.string()),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type PerspectivaResult = z.infer<typeof PerspectivaResultSchema>;

export const PerspectiveTreeRequestSchema = z.object({
  equity: z.number().min(0.0).max(1.0),
  pot_size: z.number().min(0.1),
  stack_eff: z.number().min(0.1),
  active_players: z.number().int().min(2).max(10).default(2),
  street_idx: z.number().int().min(0).max(3).default(0),
  hero_invested: z.number().min(0.0).default(0.0),
  ev_fold_dynamic: z.number().nullable().optional(),
  position: z.string().default('BTN'),
  realization_factor: z.number().default(1.0),
  valuation_stack: z.number().default(1.0),
  edge_base: z.number().default(0.05),
  aggression_factor: z.number().default(1.5),
  base_rio: z.number().default(0.0),
  loss_aversion_base: z.number().default(2.25),
  fgs_health: z.number().default(1.0),
  rp_opp: z.number().default(20.0),
  fold_equity: z.number().default(0.30),
});
export type PerspectiveTreeRequest = z.infer<typeof PerspectiveTreeRequestSchema>;

export const SolverNodeSchema = z.object({
  node_id: z.string(),
  player: z.string(),
  street: z.string(),
  pot: z.number(),
  actions: z.array(z.string()).default([]),
  strategy: z.record(z.string(), z.number()).default({}),
  ev: z.record(z.string(), z.number()).default({}),
  range_equity: z.number().nullable().optional(),
  children: z.array(z.string()).default([]),
});
export type SolverNode = z.infer<typeof SolverNodeSchema>;

export const NormalizedGameTreeSchema = z.object({
  solver_type: SolverTypeSchema,
  source_format: z.string(),
  game_type: z.string().default('MTT'),
  num_players: z.number().int().default(2),
  board: z.array(z.string()).default([]),
  starting_pot: z.number().default(0.0),
  stacks: z.record(z.string(), z.number()).default({}),
  nodes: z.record(z.string(), SolverNodeSchema).default({}),
  root_node_id: z.string().default('root'),
  pmev_converted_nodes: z.record(z.string(), PerspectivaResultSchema).default({}),
});
export type NormalizedGameTree = z.infer<typeof NormalizedGameTreeSchema>;

export const SolverImportRequestSchema = z.object({
  solver_type: SolverTypeSchema.default('auto'),
  raw_content: z.string().min(5),
  tournament_context: z.record(z.string(), z.unknown()).default({}),
});
export type SolverImportRequest = z.infer<typeof SolverImportRequestSchema>;

export const SolverImportResponseSchema = z.object({
  status: z.enum(['SUCCESS', 'ERROR']),
  solver_type: SolverTypeSchema,
  tree: NormalizedGameTreeSchema.nullable().optional(),
  node_count: z.number().int().default(0),
  error: z.string().nullable().optional(),
});
export type SolverImportResponse = z.infer<typeof SolverImportResponseSchema>;
