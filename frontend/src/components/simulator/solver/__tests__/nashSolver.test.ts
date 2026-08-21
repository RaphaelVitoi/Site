/// <reference types="jest" />

/**
 * TESTE DE VALIDAÇÃO: NashSolver — Motor ICM pós-flop
 * PATH: src/components/simulator/engine/__tests__/nashSolver.test.ts
 *
 * Valida propriedades estruturais e comportamentais do motor.
 * Âncora empírica: BTN 39bb (RP 21.4%) vs BB 54bb (RP 12.9%), ΔRP = +8.5pp
 * Fonte: 93 nodes HRC vs GTO Wizard, Aula 1.2 (board KJT-2-3)
 */

import { solveIcmDistortion } from '../nashSolver';
import type { ChipEvFreqs } from '../types';

// Frequências ChipEV da âncora empírica (calibração real)
const ANCORA: ChipEvFreqs = {
  ip_check: 2,
  ip_bet_small: 65,
  ip_bet_large: 33,
  oop_call: 45,
  oop_fold: 40,
  oop_raise: 15,
};

// Frequências ChipEV genéricas para testes de comportamento
const NEUTRO: ChipEvFreqs = {
  ip_check: 30,
  ip_bet_small: 40,
  ip_bet_large: 30,
  oop_call: 50,
  oop_fold: 35,
  oop_raise: 15,
};

// === CONSERVAÇÃO ===
describe( 'Conservação de frequências', () => {
  test( 'IP: check + bet_small + bet_large = 100 sempre', () => {
    const result = solveIcmDistortion( 21.4, 12.9, ANCORA, 1 );
    const sum = result.ip.check.center + result.ip.bet_small.center + result.ip.bet_large.center;
    expect( sum ).toBeCloseTo( 100, 5 );
  } );

  test( 'OOP: call + fold + raise = 100 sempre', () => {
    const result = solveIcmDistortion( 21.4, 12.9, ANCORA, 1 );
    const sum = result.oop.call.center + result.oop.fold.center + result.oop.raise.center;
    expect( sum ).toBeCloseTo( 100, 5 );
  } );

  test( 'Conservação com aggressionFactor 1.5x', () => {
    const result = solveIcmDistortion( 15, 10, NEUTRO, 1.5 );
    const ip = result.ip.check.center + result.ip.bet_small.center + result.ip.bet_large.center;
    const oop = result.oop.call.center + result.oop.fold.center + result.oop.raise.center;
    expect( ip ).toBeCloseTo( 100, 5 );
    expect( oop ).toBeCloseTo( 100, 5 );
  } );

  test( 'Conservação com RPs extremos', () => {
    const result = solveIcmDistortion( 24, 1, ANCORA, 3 );
    const ip = result.ip.check.center + result.ip.bet_small.center + result.ip.bet_large.center;
    const oop = result.oop.call.center + result.oop.fold.center + result.oop.raise.center;
    expect( ip ).toBeCloseTo( 100, 5 );
    expect( oop ).toBeCloseTo( 100, 5 );
  } );
} );

// === DISTORÇÃO ZERO (ΔRP = 0) ===
describe( 'ΔRP = 0: sem distorção nas apostas', () => {
  test( 'IP bet_small e bet_large correspondem ao ChipEV', () => {
    const result = solveIcmDistortion( 0, 0, NEUTRO, 1 );
    expect( result.deltaRp ).toBe( 0 );
    expect( result.ip.bet_small.center ).toBeCloseTo( NEUTRO.ip_bet_small, 1 );
    expect( result.ip.bet_large.center ).toBeCloseTo( NEUTRO.ip_bet_large, 1 );
  } );

  test( 'OOP call e raise correspondem ao ChipEV', () => {
    const result = solveIcmDistortion( 0, 0, NEUTRO, 1 );
    expect( result.oop.call.center ).toBeCloseTo( NEUTRO.oop_call, 1 );
    expect( result.oop.raise.center ).toBeCloseTo( NEUTRO.oop_raise, 1 );
  } );
} );

// === DIREÇÃO DAS DISTORÇÕES ===
describe( 'Direção das distorções ICM', () => {
  test( 'ΔRP positivo (IP sob mais pressão): apostas IP diminuem e checks aumentam (SOTA Physics)', () => {
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const pressured = solveIcmDistortion( 20, 10, NEUTRO, 1 );
    expect( pressured.ip.bet_small.center ).toBeLessThan( base.ip.bet_small.center );
    expect( pressured.ip.bet_large.center ).toBeLessThan( base.ip.bet_large.center );
    expect( pressured.ip.check.center ).toBeGreaterThan( base.ip.check.center );
  } );

  test( 'ΔRP positivo: OOP call cai por risco de ressuscitar o IP', () => {
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const pressured = solveIcmDistortion( 20, 10, NEUTRO, 1 );
    expect( pressured.oop.call.center ).toBeLessThan( base.oop.call.center );
  } );

  test( 'ΔRP negativo (OOP sob mais pressão): apostas IP aumentam (SOTA Physics, IP explora a pressão no OOP)', () => {
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const pressured = solveIcmDistortion( 10, 20, NEUTRO, 1 );
    expect( pressured.ip.bet_small.center ).toBeGreaterThan( base.ip.bet_small.center );
    expect( pressured.ip.bet_large.center ).toBeGreaterThan( base.ip.bet_large.center );
    expect( pressured.ip.check.center ).toBeLessThan( base.ip.check.center );
  } );

  test( 'oop_raise usa |ΔRP| sem sign (comprime em ambas as direções)', () => {
    // Em ambos os lados, oop_raise deve cair com |ΔRP| crescente (k = -9)
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const ipOver = solveIcmDistortion( 20, 10, NEUTRO, 1 );
    const oopOver = solveIcmDistortion( 10, 20, NEUTRO, 1 );
    expect( ipOver.oop.raise.center ).toBeLessThan( base.oop.raise.center );
    expect( oopOver.oop.raise.center ).toBeLessThan( base.oop.raise.center );
  } );
} );

// === AGGRESSION FACTOR ===
describe( 'aggressionFactor', () => {
  test( 'aggressionFactor altera frequências do IP (SOTA 8.0: IP reage logicamente à pressão)', () => {
    const gto = solveIcmDistortion( 15, 10, NEUTRO, 1 );
    const agg = solveIcmDistortion( 15, 10, NEUTRO, 1.5 );
    expect( agg.ip.bet_small.center ).not.toBe( gto.ip.bet_small.center );
    expect( agg.ip.check.center ).not.toBe( gto.ip.check.center );
  } );

  test( 'aggressionFactor afeta OOP call indiretamente via contração do raise (SOTA v7.0 GOLD)', () => {
    const gto = solveIcmDistortion( 15, 10, NEUTRO, 1 );
    const agg = solveIcmDistortion( 15, 10, NEUTRO, 1.5 );
    // Em Topologic Aggression 2.0, um maior aggressionFactor eleva o raise, o que comprime o call.
    expect( agg.oop.call.center ).toBeLessThan( gto.oop.call.center );
  } );
} );

// === EXPOENTE b (CURVA CÃ”NCAVA) ===
describe( 'Expoente b (curva côncava)', () => {
  test( 'b decresce com maior pressão ICM (avgRp maior)', () => {
    const low = solveIcmDistortion( 5, 5, NEUTRO, 1 );
    const high = solveIcmDistortion( 20, 20, NEUTRO, 1 );
    expect( high.bExponent ).toBeLessThan( low.bExponent );
  } );

  test( 'b → 1 quando RPs → 0 (ChipEV puro)', () => {
    const result = solveIcmDistortion( 0, 0, NEUTRO, 1 );
    expect( result.bExponent ).toBeCloseTo( 1, 3 );
  } );

  test( 'b > 0 sempre (nunca colapsa)', () => {
    const result = solveIcmDistortion( 24, 24, NEUTRO, 1 );
    expect( result.bExponent ).toBeGreaterThan( 0 );
  } );
} );

// === CLAMPING E SANITIZAÇÃO ===
describe( 'Clamping e sanitização de inputs', () => {
  test( 'Todas as frequências ficam entre 0 e 100', () => {
    const result = solveIcmDistortion( 100, 100, ANCORA, 3 );
    const freqs = [
      result.ip.check.center, result.ip.bet_small.center, result.ip.bet_large.center,
      result.oop.call.center, result.oop.fold.center, result.oop.raise.center,
    ];
    freqs.forEach( f => {
      expect( f ).toBeGreaterThanOrEqual( 0 );
      expect( f ).toBeLessThanOrEqual( 100 );
    } );
  } );

  test( 'deltaRp calculado corretamente na âncora', () => {
    const result = solveIcmDistortion( 21.4, 12.9, ANCORA, 1 );
    expect( result.deltaRp ).toBeCloseTo( 8.5, 1 );
  } );

  test( 'rawData preserva inputs originais', () => {
    const result = solveIcmDistortion( 21.4, 12.9, ANCORA, 1 );
    expect( result.rawData.ipRp ).toBeCloseTo( 21.4, 1 );
    expect( result.rawData.oopRp ).toBeCloseTo( 12.9, 1 );
    expect( result.rawData.chipEvFreqs ).toEqual( ANCORA );
  } );

  test( 'spread sempre positivo', () => {
    const result = solveIcmDistortion( 21.4, 12.9, ANCORA, 1 );
    expect( result.ip.check.spread ).toBeGreaterThan( 0 );
    expect( result.oop.call.spread ).toBeGreaterThan( 0 );
  } );
} );

