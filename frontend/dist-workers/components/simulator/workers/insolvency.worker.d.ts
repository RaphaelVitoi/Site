/** @format */
export declare const __INSOLVENCY_WORKER__ = true;

export interface MultiwayPayload {
  type: 'MULTIWAY_MATRIX';
  rangesData: Float64Array;
  numPlayers: number;
  boardMask: number;
  targetIterations: number;
  seed: number;
  id: number;
}
