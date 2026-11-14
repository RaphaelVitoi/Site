import { act, renderHook } from '@testing-library/react';
import { useQuantumEngine, type QuantumEngineParams } from '@/components/simulator/hooks/useQuantumEngine';
import NashPanel from '@/components/simulator/panels/NashPanel';
import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

class WorkerFalso {
  static instancias: WorkerFalso[] = [];
  enviados: Array<{ type: string; id: number }> = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    WorkerFalso.instancias.push(this);
  }
  postMessage(m: { type: string; id: number }) {
    this.enviados.push(m);
  }
  terminate() {}
}

const freqs = { ip_check: 40, ip_bet_small: 35, ip_bet_large: 25, oop_call: 50, oop_fold: 40, oop_raise: 10 };
const params = (scenario = SCENARIOS[2]!): QuantumEngineParams => ({
  scenario,
  pkoValue: 0,
  isNearPayjump: false,
  blindsRisingSoon: false,
  streetFreqs: { flop: freqs, turn: freqs, river: freqs },
  aggressionFactor: 1.2,
  heroPosition: 'IP',
  heroIsIp: true,
});

describe('useQuantumEngine -- distorção calculada uma vez e matriz presa ao cenário (SIM-02, SIM-04)', () => {
  const workerOriginal = (globalThis as { Worker?: unknown }).Worker;

  beforeEach(() => {
    jest.useFakeTimers();
    WorkerFalso.instancias = [];
    (globalThis as { Worker?: unknown }).Worker = WorkerFalso;
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as { Worker?: unknown }).Worker = workerOriginal;
  });

  it('nao envia DISTORTION ao worker e entrega as tres streets na primeira renderizacao', () => {
    const { result, rerender } = renderHook((p: QuantumEngineParams) => useQuantumEngine(p), {
      initialProps: params(),
    });
    expect(result.current.nashResults.flop).toBe(result.current.nashFlop);
    expect(result.current.nashResults.river).toBe(result.current.nashRiver);

    rerender({ ...params(), aggressionFactor: 0.8 });
    act(() => jest.advanceTimersByTime(500));
    const worker = WorkerFalso.instancias.at(-1)!;
    expect(worker.enviados.filter((m) => m.type === 'DISTORTION')).toHaveLength(0);
  });

  it('trocar de cenario descarta a matriz anterior e invalida o pedido pendente', () => {
    const { result, rerender } = renderHook((p: QuantumEngineParams) => useQuantumEngine(p), {
      initialProps: params(),
    });
    const worker = WorkerFalso.instancias.at(-1)!;
    act(() => {
      result.current.dispatchInsolvencyMatrix({
        villainRange: 'KK',
        board: '',
        rpFactor: 0.2,
        heroInvested: 1,
        currentPot: 5,
        activePlayers: 2,
      });
      jest.advanceTimersByTime(200);
    });
    const pedido = worker.enviados.find((m) => m.type === 'MATRIX')!;

    rerender(params(SCENARIOS[3]!));
    act(() =>
      worker.onmessage?.({
        data: { type: 'MATRIX', id: pedido.id, outputKind: 'working-model', matrix: [0.7, 0.25, 0.05, 1, 0.1] },
      } as MessageEvent),
    );
    expect(result.current.insolvencyMatrixData).toBeNull();
    expect(result.current.isCalculatingInsolvency).toBe(false);
  });

  it('preserva identidade referencial do retorno do useQuantumEngine entre renders equivalentes (multiwayTensorRef fora de deps)', () => {
    const initial = params();
    const { result, rerender } = renderHook((p: QuantumEngineParams) => useQuantumEngine(p), {
      initialProps: initial,
    });
    const firstReturn = result.current;

    // Mutar a ref interna não deve invalidar o contrato de memoização.
    firstReturn.multiwayTensorRef.current = new Float64Array([1, 2, 3]);

    // Re-render com novo objeto de parametros estruturalmente equivalente
    rerender(params());
    expect(result.current).toBe(firstReturn);
  });

  it('NashPanel memoizado ignora re-renders do pai quando callbacks permanecem estaveis', () => {
    const metric = { center: 50, spread: 5, delta: 0 };
    const nashStub = {
      deltaRp: 5,
      bExponent: 1,
      rawData: { ipRp: 10, oopRp: 12, chipEvFreqs: freqs },
      ip: { check: metric, bet_small: metric, bet_large: metric },
      oop: { fold: metric, call: metric, raise: metric },
    };
    const streetRps = {
      flop: { ip: 10, oop: 12 },
      turn: { ip: 8, oop: 10 },
      river: { ip: 6, oop: 8 },
    };
    const nashBodyReadSpy = jest.fn();
    const streetFreqs = { turn: freqs, river: freqs } as {
      flop: typeof freqs;
      turn: typeof freqs;
      river: typeof freqs;
    };
    Object.defineProperty(streetFreqs, 'flop', {
      enumerable: true,
      get() {
        nashBodyReadSpy();
        return freqs;
      },
    });

    expect((NashPanel as unknown as { $$typeof?: symbol }).$$typeof).toBe(Symbol.for('react.memo'));

    function Host() {
      const [unrelatedTick, setUnrelatedTick] = React.useState(0);
      const [aggression, setAggression] = React.useState(1);
      const stableNoop = React.useCallback(() => {}, []);
      const stableAggression = React.useCallback((v: number) => setAggression(v), []);

      return React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'tick-btn', onClick: () => setUnrelatedTick((t) => t + 1) },
          String(unrelatedTick),
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'agg-btn', onClick: () => setAggression((a) => a + 0.1) },
          String(aggression),
        ),
        React.createElement(NashPanel, {
          nashFlop: nashStub,
          nashTurn: nashStub,
          nashRiver: nashStub,
          streetFreqs,
          streetRps,
          aggressionFactor: aggression,
          pkoValue: 0,
          isNearPayjump: false,
          blindsRisingSoon: false,
          onStreetFreqChange: stableNoop,
          onAggressionChange: stableAggression,
          onPkoChange: stableNoop,
          onPayjumpToggle: stableNoop,
          onBlindsToggle: stableNoop,
        }),
      );
    }

    const { getByTestId } = render(React.createElement(Host));
    expect(nashBodyReadSpy).toHaveBeenCalledTimes(1);
    nashBodyReadSpy.mockClear();

    fireEvent.click(getByTestId('tick-btn'));
    fireEvent.click(getByTestId('tick-btn'));
    fireEvent.click(getByTestId('tick-btn'));
    expect(getByTestId('tick-btn').textContent).toBe('3');

    // 3 re-renders no componente pai com props estaveis => React.memo faz bailout (0 renders em NashPanel)
    expect(nashBodyReadSpy).toHaveBeenCalledTimes(0);

    // Mudanca real de prop relevante dispara exatamente 1 re-render em NashPanel
    fireEvent.click(getByTestId('agg-btn'));
    expect(nashBodyReadSpy).toHaveBeenCalledTimes(1);
  });
});
