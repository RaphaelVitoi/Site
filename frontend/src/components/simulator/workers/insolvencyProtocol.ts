import type { ChipEvFreqs, IcmDistortionResult } from '../solver/types';
import type { PerspectivaResult, ReferencePointStatus } from '../../../lib/perspectiva';

export interface InsolvencyPayload {
  villainRange: string;
  board: string;
  rpFactor: number;
  heroInvested: number;
  currentPot: number;
  activePlayers: number;
  kappaOverride?: number;
  heroRange?: string;
  betSizing?: number;
}

export interface DistortionPayload {
  ipRpFlop: number;
  oopRpFlop: number;
  freqFlop: ChipEvFreqs;
  ipRpTurn: number;
  oopRpTurn: number;
  freqTurn: ChipEvFreqs;
  ipRpRiver: number;
  oopRpRiver: number;
  freqRiver: ChipEvFreqs;
  topologicAggression: number;
  activePlayers: number;
  pots: [number, number, number];
}

export interface MultiwayPayload {
  rangesData: Float64Array; // SOTA Zero-Copy Array
  numPlayers: number;
  boardMask: number;
  targetIterations: number;
  seed?: number;
}

export interface NashDistortionResults {
  flop?: IcmDistortionResult;
  turn?: IcmDistortionResult;
  river?: IcmDistortionResult;
}

export interface InsolvencyMetrics {
  winRate: number;
  loseRate: number;
  tieRate: number;
  trueInsolvencyEv: number;
  riskIndex: number;
}

/** Outputs are executable working models, not an assertion of theoretical fidelity. */
export type InsolvencyWorkerRequest =
  | (InsolvencyPayload & { type: 'MATRIX'; id: number; kappa: number; humanNoiseFactor: number; iterations?: number; seed?: number })
  | (DistortionPayload & { type: 'DISTORTION'; id: number; humanNoiseFactor: number })
  | (MultiwayPayload & { type: 'MULTIWAY_MATRIX'; id: number });

export interface InsolvencyWorkerResponse {
  type: InsolvencyWorkerRequest['type'];
  id: number;
  outputKind: 'working-model' | 'scaffold';
  error?: string;
  nashResults?: NashDistortionResults;
  matrix?: number[];
  multiwayResult?: Float64Array;
}

export interface MultiwayRioRequest {
  type: 'MULTIWAY_RIO';
  id: string | number;
  maxPlayers: number;
  sprLevels: number;
  baseTension: number;
}

export interface PerspectiveWorkerRequest {
  type: 'CALCULATE_PERSPECTIVE';
  id?: number;
  payload: {
    stacks: number[]; prizes: number[]; kappa: number; numPlayers: number;
    bountyValue: number; potSize: number; heroCost: number; winProb: number;
    realization: number; edgeBase: number; isNearPayjump: boolean; blindsRising: boolean;
    humanNoiseFactor: number; heroRp: number; villainRp: number; stackEff: number;
    referenceStatus: ReferencePointStatus;
  };
}

export type SimulatorWorkerRequest = InsolvencyWorkerRequest | MultiwayRioRequest | PerspectiveWorkerRequest;
export type SimulatorWorkerResponse = InsolvencyWorkerResponse
  | { type: 'MULTIWAY_RIO_RESULT'; id: string | number; matrix: Float32Array; outputKind: 'working-model' }
  | { type: 'WASM_RESULT'; id?: number; result: PerspectivaResult; outputKind: 'working-model'; engine: 'typescript' }
  | { type: 'ERROR'; id?: number | string; error: string; outputKind: 'working-model' };
