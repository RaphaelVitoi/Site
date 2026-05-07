'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ICMPlayer, ICMResult } from '@/lib/icmEngine';
import { logger } from '@/lib/logger';

interface IcmCalculationsParams {
    players: ICMPlayer[];
    prizes: number[];
}

export function useIcmCalculations({ players, prizes }: IcmCalculationsParams) {
    const [results, setResults] = useState<ICMResult[]>([]);
    const [isWorkerCalculating, setIsWorkerCalculating] = useState(false);
    const icmWorkerRef = useRef<Worker | null>(null);
    const activeJobIdRef = useRef<string>('');
    const activePlayersRef = useRef<ICMPlayer[]>([]);

    useEffect(() => {
        const worker = new Worker(new URL('../workers/icm.worker.ts', import.meta.url));
        worker.onmessage = (e: MessageEvent) => {
            if (e.data.id !== activeJobIdRef.current) return;
            if (e.data.error) {
                console.error('[useIcmCalculations] ICM Worker error:', e.data.error);
                setIsWorkerCalculating(false);
                return;
            }
            if (e.data.type === 'ICM_RESULT') {
                const f64Results = e.data.payload as Float64Array;
                const currentPlayers = activePlayersRef.current;
                const decodedResults: ICMResult[] = currentPlayers.map((p, i) => ({
                    id: p.id,
                    name: p.name,
                    equity: f64Results[i * 3 + 0],
                    equityPercent: f64Results[i * 3 + 1],
                    winProb: f64Results[i * 3 + 2]
                }));
                setResults(decodedResults);
                const totalEq = decodedResults.reduce((sum, r) => sum + r.equityPercent, 0);
                logger.metric('useIcmCalculations', 'icm_total_equity', totalEq, { playerCount: currentPlayers.length });
                setIsWorkerCalculating(false);
            }
        };
        icmWorkerRef.current = worker;
        return () => worker.terminate();
    }, []);

    useEffect(() => {
        if (!icmWorkerRef.current || players.length === 0) return;
        const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
        activeJobIdRef.current = id;
        activePlayersRef.current = players;
        setIsWorkerCalculating(true);
        icmWorkerRef.current.postMessage({ id, players, prizes });
    }, [players, prizes]);

    const totalChips = useMemo(() => players.reduce((sum, p) => sum + p.stack, 0), [players]);
    const totalPrizes = useMemo(() => prizes.reduce((sum, p) => sum + p, 0), [prizes]);

    return { results, isWorkerCalculating, totalChips, totalPrizes };
}
