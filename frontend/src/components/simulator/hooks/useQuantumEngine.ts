import type { InsolvencyPayload, DistortionPayload, MultiwayPayload, NashDistortionResults, InsolvencyMetrics, InsolvencyWorkerRequest, InsolvencyWorkerResponse } from '../workers/insolvencyProtocol';
export type { InsolvencyPayload, DistortionPayload, MultiwayPayload, NashDistortionResults, InsolvencyMetrics } from '../workers/insolvencyProtocol';
/** @format */

import { calculatePerspectivaVitoi } from '@/lib/perspectiva';
import { derivePostFlopRps, deriveRps, type PostFlopResult } from '@/lib/rpDeriver';
import { logTelemetryEvent } from '@/lib/telemetry-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { solveIcmDistortion } from '../solver/nashSolver';
import type {
  ChipEvFreqs,
  HeroPosition,
  IcmDistortionResult,
  NodelockConstraint,
  Scenario,
  SprStage,
  StreetChipEvFreqs,
} from '../solver/types';

export interface QuantumEngineParams {
  scenario: Scenario;
  pkoValue: number;
  isNearPayjump: boolean;
  blindsRisingSoon: boolean;
  streetFreqs: StreetChipEvFreqs;
  aggressionFactor: number;
  heroIsIp?: boolean;
  heroPosition?: HeroPosition;
  anteSize?: number;
  heroInvestedBb?: number;
  currentPotBb?: number;
  activePlayers?: number;
  kappaValue?: number;
  activeNodelock?: NodelockConstraint | null;
  isPredictive?: boolean;
  predictiveProfile?: Record<string, number> | null;
}

export type QuantumMetricsResult = InsolvencyMetrics;
export type QuantumMetricsPayload = InsolvencyPayload;

export function useQuantumEngine({
  scenario,
  pkoValue = 0,
  isNearPayjump = false,
  blindsRisingSoon = false,
  streetFreqs = {
    flop: {} as ChipEvFreqs,
    turn: {} as ChipEvFreqs,
    river: {} as ChipEvFreqs,
  },
  aggressionFactor = 1,
  heroIsIp = false,
  heroPosition = 'IP',
  anteSize = 12.5,
  heroInvestedBb,
  currentPotBb,
  activePlayers = 2,
  kappaValue = 1,
  activeNodelock = null,
  isPredictive = true,
  predictiveProfile = null,
}: Readonly<QuantumEngineParams>) {
  const ipIndex = 0;
  const oopIndex = 1;

  // SOTA FIX: Selagem de Referências (Evita vazamento de rerenders e GC Thrashing O(N^3))
  const stableStacksStr = scenario.stacks?.join('|') || '';
  const stableStacks = useMemo(() => scenario.stacks || [], [stableStacksStr]);

  const stablePrizesStr = scenario.prizes?.join('|') || '';
  const stablePrizes = useMemo(() => scenario.prizes || [], [stablePrizesStr]);

  const stableSprDataStr = scenario.sprData?.map((s) => `${s.name}:${s.potSize}`).join('|') || '';
  const stableSprData = useMemo(() => scenario.sprData || [], [stableSprDataStr]);

  // SOTA FIX: Selagem Profunda para o objeto complexo de Frequências (Evita default param leakage)
  const stableStreetFreqsStr = JSON.stringify(streetFreqs);

  const stableStreetFreqs = useMemo(() => streetFreqs, [stableStreetFreqsStr]);

  const numPlayers = useMemo(() => stableStacks.length || 2, [stableStacks]);
  const anteInBb = useMemo(() => anteSize / 100, [anteSize]);

  // SOTA: Fallback de Sobrevivência. Se o Lab omitir prêmios, injetamos a FT 9-max baseline para garantir a Perspectiva.
  const resolvedPrizes = useMemo(() => {
    return stablePrizes.length > 0 ? stablePrizes : [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47];
  }, [stablePrizes]);

  // SOTA: Economia Generalizada (Cálculo único de baseline para o ciclo de renderização)
  const isBaseline = useMemo(
    () => scenario.category === 'baseline' || resolvedPrizes.length <= 1,
    [scenario.category, resolvedPrizes.length],
  );

  // SOTA: Estados e Refs do Web Worker de Insolvência
  const [insolvencyMatrixData, setInsolvencyMatrixData] = useState<InsolvencyMetrics | null>(null);
  const [isCalculatingInsolvency, setIsCalculatingInsolvency] = useState(false);
  const [nashResults, setNashResults] = useState<NashDistortionResults | null>(null);
  const insolvencyWorkerRef = useRef<Worker | null>(null);

  // SOTA: Refatoração para Mutabilidade Silenciosa. Elimina VDOM Thrashing e GC Churn.
  const multiwayTensorRef = useRef<Float64Array | null>(null);
  const [isCalculatingMultiway, setIsCalculatingMultiway] = useState(false);

  const lastRequestIdRef = useRef({ MATRIX: 0, DISTORTION: 0, MULTIWAY_MATRIX: 0 });
  const matrixTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const distortionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const multiwayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicialização do Web Worker
  useEffect(() => {
    const worker = new Worker(new URL('../workers/insolvency.worker.ts', import.meta.url), {
      type: 'module',
    });
    insolvencyWorkerRef.current = worker;

    worker.onmessage = (e: MessageEvent<InsolvencyWorkerResponse>) => {
      if (!e.data || !['MATRIX', 'DISTORTION', 'MULTIWAY_MATRIX'].includes(e.data.type)) return;
      // Validação de versão: Ignora resultados de requisições antigas
      if (e.data.id !== lastRequestIdRef.current[e.data.type]) return;

      if (e.data.error) {
        console.warn('[SotaEcosystem] Entropia de Input (Insolvency WASM):', e.data.error);
        if (e.data.type === 'MULTIWAY_MATRIX') setIsCalculatingMultiway(false);
        if (e.data.type === 'MATRIX') setIsCalculatingInsolvency(false);
      } else if (e.data.type === 'DISTORTION' && e.data.nashResults) {
        setNashResults(e.data.nashResults);
      } else if (e.data.type === 'MATRIX' && e.data.matrix) {
        const m = e.data.matrix;
        if (m && m.length >= 5) {
          const [winRate, loseRate, tieRate, trueInsolvencyEv, riskIndex] = m;
          if (
            winRate === undefined ||
            loseRate === undefined ||
            tieRate === undefined ||
            trueInsolvencyEv === undefined ||
            riskIndex === undefined
          ) {
            setInsolvencyMatrixData(null);
            setIsCalculatingInsolvency(false);
            return;
          }
          setInsolvencyMatrixData({
            winRate,
            loseRate,
            tieRate,
            trueInsolvencyEv,
            riskIndex,
          });
        } else {
          setInsolvencyMatrixData(null);
        }
        setIsCalculatingInsolvency(false);
      } else if (e.data.type === 'MULTIWAY_MATRIX' && e.data.multiwayResult) {
        // SOTA: Atualiza a referência de memória invisivelmente para o React.
        // O Canvas consumirá isto em loop de hardware (requestAnimationFrame).
        multiwayTensorRef.current = e.data.multiwayResult;
        setIsCalculatingMultiway(false);
      }
    };

    worker.onerror = (e) => {
      console.error('[SotaEcosystem] Falha catastrófica no Worker:', e);
      setIsCalculatingInsolvency(false);
      setIsCalculatingMultiway(false);
    };

    return () => {
      worker.terminate();
      insolvencyWorkerRef.current = null;
      if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current);
      if (distortionTimeoutRef.current) clearTimeout(distortionTimeoutRef.current);
      if (multiwayTimeoutRef.current) clearTimeout(multiwayTimeoutRef.current);
    };
  }, []);

  // SOTA: Fricção Zero no Fator de Credibilidade (Axioma Lipe Piv).
  // O recálculo engatilha somente se a variação for superior a 0.05 para evitar inundação do Event Loop (debouncing quantizado).
  const effectiveKappa = useMemo(() => {
    return Math.round(kappaValue * 20) / 20;
  }, [kappaValue]);

  const humanNoiseFactor = useMemo(() => {
    if (!isPredictive || !predictiveProfile) return 0;
    return predictiveProfile['Desvio de Nash'] ?? 0;
  }, [isPredictive, predictiveProfile]);

  const dispatchInsolvencyMatrix = useCallback(
    (payload: InsolvencyPayload) => {
      const {
        villainRange,
        board,
        rpFactor,
        heroInvested,
        currentPot,
        activePlayers,
        kappaOverride,
        heroRange = 'AhKd',
        betSizing = 0.5,
      } = payload;

      if (!insolvencyWorkerRef.current) return;
      setIsCalculatingInsolvency(true);
      if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current);
      const id = ++lastRequestIdRef.current.MATRIX;
      matrixTimeoutRef.current = setTimeout(() => {
        insolvencyWorkerRef.current?.postMessage({
          type: 'MATRIX',
          heroRange,
          villainRange,
          board,
          rpFactor,
          heroInvested,
          currentPot,
          activePlayers,
          kappa: kappaOverride ?? effectiveKappa,
          betSizing,
          humanNoiseFactor,
          id,
        } satisfies InsolvencyWorkerRequest);
      }, 150);
    },
    [effectiveKappa, humanNoiseFactor],
  );

  const dispatchIcmDistortion = useCallback(
    (payload: DistortionPayload) => {
      if (!insolvencyWorkerRef.current) return;
      if (distortionTimeoutRef.current) clearTimeout(distortionTimeoutRef.current);
      setNashResults(null);
      const id = ++lastRequestIdRef.current.DISTORTION;
      distortionTimeoutRef.current = setTimeout(() => {
        insolvencyWorkerRef.current?.postMessage({
          type: 'DISTORTION',
          ...payload,
          humanNoiseFactor,
          id,
        } satisfies InsolvencyWorkerRequest);
      }, 150);
    },
    [humanNoiseFactor],
  );

  // SOTA: Despachante Quântico Multiway via Transferable Objects
  const dispatchMultiwayMatrix = useCallback((payload: MultiwayPayload) => {
    const {
      rangesData,
      numPlayers,
      boardMask,
      targetIterations,
      seed = typeof crypto !== 'undefined' && crypto.getRandomValues
        ? (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0)
        : Date.now() & 0xffffffff,
    } = payload;

    if (!insolvencyWorkerRef.current) return;
    setIsCalculatingMultiway(true);
    if (multiwayTimeoutRef.current) clearTimeout(multiwayTimeoutRef.current);

    const id = ++lastRequestIdRef.current.MULTIWAY_MATRIX;
    multiwayTimeoutRef.current = setTimeout(() => {
      // SOTA ZERO-COPY TRANSFER: Transferimos o ArrayBuffer nativo diretamente para o Worker.
      // Isso extirpa a clonagem pesada (Structured Clone) do JS e aniquila os vazamentos de GC no React.
      insolvencyWorkerRef.current?.postMessage(
        {
          type: 'MULTIWAY_MATRIX',
          rangesData,
          numPlayers,
          boardMask,
          targetIterations,
          seed,
          id,
        } satisfies InsolvencyWorkerRequest,
        [rangesData.buffer],
      ); // <- A Mágica SOTA: Transferência absoluta de posse da memória.
    }, 150);
  }, []);

  // Incentivo intrinseco do pote pre-flop (dead money).
  // Quanto maior, menor a pressao relativa do ICM.
  const preflopDeadMoney = useMemo(() => {
    if (currentPotBb !== undefined && currentPotBb > 0) return currentPotBb;
    if (numPlayers < 2) return 1.5; // Fallback para HU
    return 1.5 + numPlayers * anteInBb; // SB (0.5) + BB (1.0) + Antes
  }, [numPlayers, anteInBb, currentPotBb]);

  // Custo Base de Desistência (EV_Fold)
  // OOP assume BB (1BB + Ante). IP assume BTN (0BB + Ante).
  const foldEvBb = useMemo(() => {
    // SOTA: O Sunk Cost agora respeita o escalonamento (3bets, 4bets) e preserva a soma do Ante.
    let baseInvested: number;
    if (heroInvestedBb === undefined) {
      baseInvested = heroIsIp ? 0 : 1;
    } else {
      baseInvested = Math.abs(heroInvestedBb);
    }
    return -(baseInvested + anteInBb);
  }, [heroIsIp, anteInBb, heroInvestedBb]);

  // Derivar Perspectiva Matemática Quantum (v4.0)
  const quantumPerspectiva = useMemo(() => {
    // SOTA: Fator R (Realização) atenuado pelo Axioma Lipe Piv.
    // Se a credibilidade do vilão é baixa (kappa < 1), a penalidade posicional é diluída,
    // aproximando a realização OOP do Bluff-Catcher Puro.
    const baseRealization = heroIsIp ? 1 : 0.85;
    const realizationFactor = heroIsIp ? 1 : baseRealization + 0.15 * (1 - effectiveKappa);
    try {
      return calculatePerspectivaVitoi({
        stacks: stableStacks,
        prizes: resolvedPrizes,
        heroIdx: ipIndex,
        villainIdx: oopIndex,
        potSize: preflopDeadMoney,
        heroCost: Math.abs(foldEvBb),
        winProb: 0.5,
        realizationFactor: realizationFactor,
        edgeBase: 1,
        bountyValue: pkoValue * 100,
        isNearPayjump,
        blindsRisingSoon,
        heroPosition, // SOTA: Injeção de Antevisão Posicional
        humanNoiseFactor, // SOTA v7.0: Injeção de Entropia
      });
    } catch (e: unknown) {
      // SOTA: Preserva a logagem crua na Engine do Browser
      console.error('[QuantumEngine] Falha na PM Lens:', e);
      return null;
    }
  }, [
    stableStacks,
    resolvedPrizes,
    pkoValue,
    isNearPayjump,
    blindsRisingSoon,
    preflopDeadMoney,
    foldEvBb,
    heroPosition,
    heroIsIp,
    effectiveKappa,
    humanNoiseFactor,
  ]);

  // Derivar RP automaticamente via Malmuth-Harville (Base)
  const derivedRp = useMemo(() => {
    if (isBaseline) return null;

    const t0 = performance.now();
    try {
      const res = deriveRps(stableStacks, resolvedPrizes, ipIndex, oopIndex, pkoValue * 100);
      const t1 = performance.now();
      const latency = t1 - t0;

      if (latency > 50) {
        logTelemetryEvent({
          category: 'performance',
          componentName: `MasterSimulator:${scenario.id}:deriveRps`,
          latency: Math.round(latency),
          metadata: { stacksCount: stableStacks.length || 0, pko: pkoValue },
        });
      }
      return res;
    } catch {
      return null;
    }
  }, [scenario.id, stableStacks, resolvedPrizes, pkoValue, isBaseline]);

  // RP Efetivo Quantum: O RP base é ajustado pela Perspectiva (Piso Dinâmico)
  const rpAdjustment = useMemo(() => {
    if (!quantumPerspectiva || isBaseline) return 0;

    // SOTA: Erradicação do Magic Number (10).
    // O delta positivo entre o ganho de sobrevivência e a dor em ICM real do fold gera a pressão inflacionária.
    const survivalGain = quantumPerspectiva.dynamicEvFold || 0;
    // P1 FIX: costOfFold unificado em Perspectiva EV (% do pool), pareado semanticamente com survivalGain.
    const costOfFold = Math.abs(quantumPerspectiva.deltaFoldPct);

    // SOTA: O incentivo do dead money modula a pressao do ICM.
    // Um pote maior (mais dead money) reduz a aversao ao risco.
    const standardDeadMoney = 2.625; // Baseline: 9-handed com 12.5% ante (1.5 + 9*0.125)
    const deadMoneyFactor = preflopDeadMoney > 0 ? standardDeadMoney / preflopDeadMoney : 1;

    if (survivalGain <= costOfFold) return 0;

    const initialPotSize = stableSprData.find((s: SprStage) => s.name === 'FLOP')?.potSize || 7.5;
    const baseAdjustment = (survivalGain - costOfFold) * (initialPotSize / 2);
    return baseAdjustment * deadMoneyFactor;
  }, [quantumPerspectiva, stableSprData, preflopDeadMoney, isBaseline]);

  const effectiveIpRp = Math.max(0, ((derivedRp?.ipRp ?? Number(scenario.ipRp)) || 0) + rpAdjustment);
  const effectiveOopRp = Math.max(0, ((derivedRp?.oopRp ?? Number(scenario.oopRp)) || 0) + rpAdjustment);

  let rpSource = 'manual';
  if (derivedRp) {
    rpSource = scenario.category === 'baseline' ? 'ICMev Puro' : 'Quantum v4.1';
  }

  // --- MOTOR DE PROPAGAÇÃO REVERSA (ORGANISMO VITOI) ---
  const postFlopPots = useMemo<[number, number, number]>(() =>
    // SOTA: Estado purificado e tipagem estrita
    {
      const sprFlop = stableSprData.find((s: SprStage) => s.name === 'FLOP');
      const sprTurn = stableSprData.find((s: SprStage) => s.name === 'TURN');
      const sprRiver = stableSprData.find((s: SprStage) => s.name === 'RIVER');

      // SOTA: O valuation do pot dissipa o RP por streets respeitando o preflopDeadMoney como piso (Pot Entrapment escalonado).
      const potFlop = Math.max(sprFlop?.potSize ?? 7.5, preflopDeadMoney);
      let potTurn = Math.max(sprTurn?.potSize ?? 22.5, preflopDeadMoney);
      let potRiver = Math.max(sprRiver?.potSize ?? 40, preflopDeadMoney);

      if (activeNodelock?.type === 'block_bet') {
        const b20Turn = potFlop * activeNodelock.sizePct;
        potTurn = potFlop + b20Turn * 2;
        const b20River = potTurn * activeNodelock.sizePct;
        potRiver = potTurn + b20River * 2;
      }

      return [potFlop, potTurn, potRiver];
    }, [stableSprData, preflopDeadMoney, activeNodelock]);

  const postFlopRps = useMemo(() => {
    if (isBaseline) return null;

    const [potFlop, potTurn, potRiver] = postFlopPots;

    const river = derivePostFlopRps(stableStacks, resolvedPrizes, ipIndex, oopIndex, {
      street: 'river',
      potAcumuladoHero: potRiver / 2,
      potTotal: potRiver,
      heroIsIp,
      bountyValue: pkoValue * 100,
    });

    const turnFutureRpInfluence = heroIsIp ? (river?.ipRp ?? 0) : (river?.oopRp ?? 0);
    const turn = derivePostFlopRps(stableStacks, resolvedPrizes, ipIndex, oopIndex, {
      street: 'turn',
      potAcumuladoHero: potTurn / 2,
      potTotal: potTurn,
      heroIsIp,
      bountyValue: pkoValue * 100,
      futureRpInfluence: turnFutureRpInfluence,
    });

    const flopFutureRpInfluence = heroIsIp ? (turn?.ipRp ?? 0) : (turn?.oopRp ?? 0);
    const flop = derivePostFlopRps(stableStacks, resolvedPrizes, ipIndex, oopIndex, {
      street: 'flop',
      potAcumuladoHero: potFlop / 2,
      potTotal: potFlop,
      heroIsIp,
      bountyValue: pkoValue * 100,
      futureRpInfluence: flopFutureRpInfluence,
    });

    return { flop, turn, river };
  }, [stableStacks, resolvedPrizes, pkoValue, heroIsIp, isBaseline, postFlopPots]);

  // SOTA: Distribuição Matemática Exponencial da Perspectiva (PMev)
  // O RP é sobre colisão. No flop, sem colisão evidente, ele é dissipado e distribuído condicional e exponencialmente.
  const ipRpFlop = postFlopRps?.flop?.ipRp ?? effectiveIpRp * Math.exp(-1.2);
  const oopRpFlop = postFlopRps?.flop?.oopRp ?? effectiveOopRp * Math.exp(-1.2);

  const ipRpTurn = postFlopRps?.turn?.ipRp ?? effectiveIpRp * Math.exp(-0.6);
  const oopRpTurn = postFlopRps?.turn?.oopRp ?? effectiveOopRp * Math.exp(-0.6);

  const ipRpRiver = postFlopRps?.river?.ipRp ?? effectiveIpRp * Math.exp(-0.1);
  const oopRpRiver = postFlopRps?.river?.oopRp ?? effectiveOopRp * Math.exp(-0.1);

  const effectiveSprData = useMemo(() => {
    if (!postFlopRps) return stableSprData;
    const baseRp = heroIsIp ? effectiveIpRp : effectiveOopRp;

    const getRp = (streetObj: PostFlopResult | null, fb: number) => {
      if (!streetObj) return fb;
      return heroIsIp ? (streetObj.ipRp ?? fb) : (streetObj.oopRp ?? fb);
    };

    const rpDispatcher: ReadonlyMap<string, (fallback: number) => number> = new Map([
      ['PRE', () => baseRp],
      ['FLOP', (fb: number) => getRp(postFlopRps.flop, fb)],
      ['TURN', (fb: number) => getRp(postFlopRps.turn, fb)],
      ['RIVER', (fb: number) => getRp(postFlopRps.river, fb)],
    ]);

    return stableSprData.map((stage: SprStage) => {
      const resolver = rpDispatcher.get(stage.name);
      return resolver ? { ...stage, rpValue: resolver(stage.rpValue) } : stage;
    });
  }, [stableSprData, postFlopRps, effectiveIpRp, effectiveOopRp, heroIsIp]);

  // SOTA VITOI: Consciência Topológica Proporcional e Condicionante
  const topologicAggression = useMemo(() => {
    let baseAggression = aggressionFactor;

    // SOTA v7.0 GOLD: Purificacao. O damping fisico agora e soberania do motor WASM.
    // Removemos a estabilizacao local para evitar "Damping Duplo".

    // Entrapment Ratio boost implicito: reduz a pressao mitigando o Downward Drift
    if (activeNodelock?.type === 'block_bet') {
      baseAggression *= 0.8;
    }

    if (isBaseline) return baseAggression;

    // A pressao do ecossistema atua como um regulador continuo.
    // Capamos em 30% de RP para normalizar o fator de 0 a 1 (0 = sem pressao, 1 = dor maxima).
    const maxRp = Math.max(effectiveIpRp, effectiveOopRp);
    const pressureIndex = Math.min(maxRp / 30, 1);

    if (isNearPayjump) {
      // Borda do Plato / Payjump: Supressao proporcional a diferenca do Ganho Real.
      const suppression = 1 - 0.3 * pressureIndex;
      return baseAggression * suppression;
    } else {
      // Vale de Pressao (Plato): Expansao proporcional.
      const expansion = 1.05 + 0.25 * (1 - pressureIndex);
      return baseAggression * expansion;
    }
  }, [aggressionFactor, isNearPayjump, isBaseline, effectiveIpRp, effectiveOopRp, activeNodelock]);

  const effectiveStreetFreqs = useMemo(() => {
    if (activeNodelock?.type === 'block_bet') {
      const override = activeNodelock.freqOverride * 100;
      return {
        flop: {
          ...stableStreetFreqs.flop,
          ip_bet_small: heroIsIp ? override : stableStreetFreqs.flop.ip_bet_small,
        },
        turn: {
          ...stableStreetFreqs.turn,
          ip_bet_small: heroIsIp ? override : stableStreetFreqs.turn.ip_bet_small,
        },
        river: {
          ...stableStreetFreqs.river,
          ip_bet_small: heroIsIp ? override : stableStreetFreqs.river.ip_bet_small,
        },
      };
    }
    return stableStreetFreqs;
  }, [stableStreetFreqs, activeNodelock, heroIsIp]);

  // SOTA: Despacho assíncrono para a esteira WASM (Web Worker)
  useEffect(() => {
    // SOTA: Payload purificado. Tipagem ChipEvFreqs estrita e validada.
    if (dispatchIcmDistortion) {
      dispatchIcmDistortion({
        ipRpFlop,
        oopRpFlop,
        freqFlop: effectiveStreetFreqs.flop,
        ipRpTurn,
        oopRpTurn,
        freqTurn: effectiveStreetFreqs.turn,
        ipRpRiver,
        oopRpRiver,
        freqRiver: effectiveStreetFreqs.river,
        topologicAggression,
        activePlayers,
        pots: postFlopPots,
      });
    }
  }, [
    dispatchIcmDistortion,
    ipRpFlop,
    oopRpFlop,
    ipRpTurn,
    oopRpTurn,
    ipRpRiver,
    oopRpRiver,
    effectiveStreetFreqs,
    topologicAggression,
    activePlayers,
    postFlopPots,
  ]);

  // SOTA FIX: Interceptador adaptativo. Protege o primeiro frame do React forçando o
  // contrato antigo do solver síncrono no novo formato estrito IP/OOP antes da resposta do Worker.
  const formatSyncSolverResult = (
    result: IcmDistortionResult,
    freqs: ChipEvFreqs,
    ipRp: number,
    oopRp: number,
  ): IcmDistortionResult | null => {
    if (!result) return null;
    if ('ip' in result && 'oop' in result && result.ip?.check?.center !== undefined) {
      result.deltaRp ??= ipRp - oopRp;
      return result;
    }
    const formatMetric = (val: number) => ({
      center: val,
      spread: 0,
      delta: 0,
    });
    return {
      deltaRp: ipRp - oopRp,
      bExponent: 1,
      rawData: { ipRp, oopRp, chipEvFreqs: freqs },
      ip: {
        check: formatMetric(freqs.ip_check || 0),
        bet_small: formatMetric(freqs.ip_bet_small || 0),
        bet_large: formatMetric(freqs.ip_bet_large || 0),
      },
      oop: {
        fold: formatMetric(result.oop?.fold?.center ?? freqs.oop_fold ?? 0),
        call: formatMetric(result.oop?.call?.center ?? freqs.oop_call ?? 0),
        raise: formatMetric(result.oop?.raise?.center ?? freqs.oop_raise ?? 0),
      },
    };
  };

  const { nashFlop, nashTurn, nashRiver } = useMemo(
    () => ({
      nashFlop:
        nashResults?.flop ??
        formatSyncSolverResult(
          solveIcmDistortion(ipRpFlop, oopRpFlop, effectiveStreetFreqs.flop, topologicAggression, postFlopPots[0], 0, activePlayers),
          effectiveStreetFreqs.flop,
          ipRpFlop,
          oopRpFlop,
        ),
      nashTurn:
        nashResults?.turn ??
        formatSyncSolverResult(
          solveIcmDistortion(ipRpTurn, oopRpTurn, effectiveStreetFreqs.turn, topologicAggression, postFlopPots[1], 1, activePlayers),
          effectiveStreetFreqs.turn,
          ipRpTurn,
          oopRpTurn,
        ),
      nashRiver:
        nashResults?.river ??
        formatSyncSolverResult(
          solveIcmDistortion(ipRpRiver, oopRpRiver, effectiveStreetFreqs.river, topologicAggression, postFlopPots[2], 2, activePlayers),
          effectiveStreetFreqs.river,
          ipRpRiver,
          oopRpRiver,
        ),
    }),
    [
      nashResults,
      ipRpFlop,
      oopRpFlop,
      ipRpTurn,
      oopRpTurn,
      ipRpRiver,
      oopRpRiver,
      effectiveStreetFreqs,
      topologicAggression,
      postFlopPots,
      activePlayers,
    ],
  );

  // SOTA: Isolamento de referência para evitar GC Churn e quebra de memoização downstream
  const streetRps = useMemo(
    () => ({
      flop: { ip: ipRpFlop, oop: oopRpFlop, deltaRp: ipRpFlop - oopRpFlop },
      turn: { ip: ipRpTurn, oop: oopRpTurn, deltaRp: ipRpTurn - oopRpTurn },
      river: {
        ip: ipRpRiver,
        oop: oopRpRiver,
        deltaRp: ipRpRiver - oopRpRiver,
      },
      // SOTA FIX: O Header do NashPanel consome métricas globais diretamente da raiz do objeto.
      deltaRp: effectiveIpRp - effectiveOopRp,
      ip: effectiveIpRp,
      oop: effectiveOopRp,
    }),
    [ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, effectiveIpRp, effectiveOopRp],
  );

  return {
    effectiveIpRp,
    effectiveOopRp,
    rpSource,
    ipRpFlop,
    oopRpFlop,
    ipRpTurn,
    oopRpTurn,
    ipRpRiver,
    oopRpRiver,
    effectiveSprData,
    nashFlop,
    nashTurn,
    nashRiver,
    streetRps,
    quantumPerspectiva,
    insolvencyMatrixData,
    isCalculatingInsolvency,
    multiwayTensorRef,
    isCalculatingMultiway,
    nashResults,
    dispatchInsolvencyMatrix,
    dispatchIcmDistortion,
    dispatchMultiwayMatrix,
  };
}
