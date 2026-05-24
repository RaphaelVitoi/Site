/** @format */
export declare const RANKS = "23456789TJQKA";
export declare const HAND_RANKING: string[];
export declare function expandPokerRange(rangeStr: string): string;
export declare function rangeToBitmask(rangeStr: string): bigint;
export declare function maskToBytes(mask: bigint): Uint8Array;
