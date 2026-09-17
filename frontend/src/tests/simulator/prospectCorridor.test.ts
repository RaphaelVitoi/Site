/**
 * IDENTITY: Testes Unitários de Integridade para o Corredor Estocástico e Âncoras Canônicas
 * PATH: src/tests/simulator/prospectCorridor.test.ts
 *
 * @format
 */

import {
  CANONICAL_ANCHORS,
  calculateStochasticCorridor,
  type StochasticCorridorInput,
} from '@/lib/prospectCorridor';

describe('prospectCorridor: Âncoras Canônicas e Corredor Estocástico', () => {
  test('exporta 5 âncoras canônicas fundamentadas no Tratado PMev', () => {
    expect(CANONICAL_ANCHORS).toHaveLength(5);
    const ids = CANONICAL_ANCHORS.map((a) => a.id);
    expect(ids).toContain('ft_bubble');
    expect(ids).toContain('convex_leverage_ip');
    expect(ids).toContain('multiway_hydra');
    expect(ids).toContain('orbital_inertia_fold');
    expect(ids).toContain('river_bluffcatcher');

    // Cada âncora deve ter critérios lógicos explícitos e diretriz estratégica
    CANONICAL_ANCHORS.forEach((anchor) => {
      expect(anchor.name).toBeTruthy();
      expect(anchor.criterioLogico.length).toBeGreaterThan(20);
      expect(anchor.diretrizEstrategica.length).toBeGreaterThan(20);
      expect(anchor.teoremaRef).toBeTruthy();
      expect(anchor.defaults.realizationFactor).toBeGreaterThan(0);
      expect(anchor.defaults.psiFactor).toBeGreaterThan(0);
    });
  });

  test('calcula corredor estocástico para Âncora 2 (Alavancagem Convexa IP)', () => {
    const input: StochasticCorridorInput = {
      rawEquity: 0.55,
      realizationFactor: 1.25,
      psiFactor: 0.8,
      spr: 7.0,
      potOdds: 0.30,
      numPlayers: 2,
      lossAversionLambda: 2.25,
    };

    const out = calculateStochasticCorridor(input);

    expect(out.matchedAnchorId).toBe('convex_leverage_ip');
    expect(out.effectiveEquityPct).toBeGreaterThan(55); // R > 1 ampliou a equidade
    expect(out.mu).toBeGreaterThan(0);
    expect(out.sigma).toBeGreaterThan(0);
    // Hierarquia das bandas
    expect(out.band2sLower).toBeLessThanOrEqual(out.band1sLower);
    expect(out.band1sLower).toBeLessThanOrEqual(out.mu);
    expect(out.mu).toBeLessThanOrEqual(out.band1sUpper);
    expect(out.band1sUpper).toBeLessThanOrEqual(out.band2sUpper);
    expect(out.solvencyProbability).toBeGreaterThan(0.5);
    expect(out.decisionStatus).toBe('soberana');
  });

  test('calcula corredor estocástico para Âncora 3 (Colapso Multiway Hidra)', () => {
    const input: StochasticCorridorInput = {
      rawEquity: 0.50,
      realizationFactor: 0.65,
      psiFactor: 1.2,
      spr: 3.0,
      potOdds: 0.25,
      numPlayers: 3,
      lossAversionLambda: 2.25,
    };

    const out = calculateStochasticCorridor(input);

    expect(out.matchedAnchorId).toBe('multiway_hydra');
    expect(out.effectiveEquityPct).toBeLessThan(50); // R comprimido
    expect(out.sigma).toBeGreaterThan(0);
    expect(out.solvencyProbability).toBeGreaterThanOrEqual(0);
    expect(out.solvencyProbability).toBeLessThanOrEqual(1);
  });

  test('calcula corredor estocástico para Âncora 1 (Bolha ICM Crítica)', () => {
    const input: StochasticCorridorInput = {
      rawEquity: 0.42,
      realizationFactor: 0.85,
      psiFactor: 1.25,
      spr: 1.5,
      potOdds: 0.38,
      numPlayers: 2,
      lossAversionLambda: 3.0,
      isNearPayjump: true,
    };

    const out = calculateStochasticCorridor(input);

    expect(out.matchedAnchorId).toBe('ft_bubble');
    // Em bolha severa com equidade marginal, mu deve ser comprimido
    expect(out.mu).toBeLessThan(10);
    expect(out.band2sLower).toBeLessThan(0); // Risco de ruína
  });

  test('estabilidade numérica contra limites extremos e divisões por zero', () => {
    const outMin = calculateStochasticCorridor({
      rawEquity: 0,
      realizationFactor: 0.1,
      psiFactor: 0.1,
      potOdds: 0,
      spr: 0,
      numPlayers: 1,
      lossAversionLambda: 0,
    });
    expect(Number.isFinite(outMin.mu)).toBe(true);
    expect(Number.isFinite(outMin.sigma)).toBe(true);
    expect(outMin.solvencyProbability).toBeGreaterThanOrEqual(0);
    expect(outMin.solvencyProbability).toBeLessThanOrEqual(1);

    const outMax = calculateStochasticCorridor({
      rawEquity: 1,
      realizationFactor: 2.0,
      psiFactor: 3.0,
      potOdds: 1,
      spr: 20,
      numPlayers: 10,
      lossAversionLambda: 5.0,
    });
    expect(Number.isFinite(outMax.mu)).toBe(true);
    expect(Number.isFinite(outMax.sigma)).toBe(true);
    expect(outMax.solvencyProbability).toBeGreaterThanOrEqual(0);
    expect(outMax.solvencyProbability).toBeLessThanOrEqual(1);
  });
});
