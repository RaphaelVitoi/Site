'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ICMPlayer, ICMResult } from '@/lib/icmEngine';
import type { TableSelection, TournamentPlayer } from '@/lib/tournamentContext';
import type { TournamentConditions } from '@/lib/tournamentConditions';
import type { IcmTableRequest, IcmTableResponse } from '../workers/icmTableProcessor';

interface IcmCalculationsParams {
  players: ICMPlayer[];
  prizes: number[];
  population: TournamentPlayer[];
  selection: TableSelection;
  conditions: TournamentConditions;
  inputError: string | null;
}

export function useIcmCalculations({ players, prizes, population, selection, conditions, inputError }: IcmCalculationsParams) {
  const [calculation, setCalculation] = useState<IcmTableResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorkerCalculating, setIsWorkerCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const activeJob = useRef('');

  useEffect(() => {
    const worker = new Worker(new URL('../workers/icm.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<IcmTableResponse | { id: string; error: string } | null | undefined>) => {
      const response = event.data;
      if (response?.id !== activeJob.current) return;
      if ('error' in response) {
        setError(response.error);
        setCalculation(null);
      } else if (response.type === 'ICM_RESULT' && response.payload instanceof Float64Array &&
        response.payload.length === response.playerIds.length * 3 && response.payload.every(Number.isFinite)) {
        setCalculation(response);
        setError(null);
      } else {
        setCalculation(null);
        setError('Resposta ICM inválida.');
      }
      setIsWorkerCalculating(false);
    };
    worker.onerror = () => {
      setCalculation(null);
      setError('Não foi possível executar o worker ICM.');
      setIsWorkerCalculating(false);
    };
    return () => { workerRef.current = null; worker.terminate(); };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    const id = globalThis.crypto.randomUUID();
    activeJob.current = id;
    if (inputError) {
      setIsWorkerCalculating(false); setError(inputError); setCalculation(null);
      return;
    }
    setIsWorkerCalculating(true);
    setError(null);
    setCalculation(null);
    workerRef.current.postMessage({ id, players: population, prizes, selection, conditions } satisfies IcmTableRequest);
  }, [population, prizes, selection, conditions, inputError]);

  const results = useMemo<ICMResult[]>(() => {
    if (!calculation) return [];
    const byId = new Map(players.map(player => [player.id, player]));
    return calculation.playerIds.flatMap((id, i) => {
      const player = byId.get(id);
      return player ? [{
        id, name: player.name, equity: calculation.payload[i * 3]!,
        equityPercent: calculation.payload[i * 3 + 1]!, winProb: calculation.payload[i * 3 + 2]!,
      }] : [];
    });
  }, [calculation, players]);

  const totalChips = useMemo(() => population.reduce((sum, p) => sum + p.stack, 0), [population]);
  const totalPrizes = useMemo(() => prizes.reduce((sum, p) => sum + p, 0), [prizes]);
  return { results, isWorkerCalculating, totalChips, totalPrizes, metadata: calculation?.metadata ?? null, error };
}
