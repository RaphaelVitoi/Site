/// <reference types="jest" />

/**
 * TESTE DE VALIDAÃ‡ÃƒO: NashSolver â€” Motor ICM pÃ³s-flop
 * PATH: src/components/simulator/engine/__tests__/nashSolver.test.ts
 *
 * Valida propriedades estruturais e comportamentais do motor.
 * Ã‚ncora empÃ­rica: BTN 39bb (RP 21.4%) vs BB 54bb (RP 12.9%), Î”RP = +8.5pp
 * Fonte: 93 nodes HRC vs GTO Wizard, Aula 1.2 (board KJT-2-3)
 */

import { solveIcmDistortion } from '../nashSolver';
import type { ChipEvFreqs } from '../types';

// FrequÃªncias ChipEV da Ã¢ncora empÃ­rica (calibraÃ§Ã£o real)
const ANCORA: ChipEvFreqs = {
  ip_check: 2,
  ip_bet_small: 65,
  ip_bet_large: 33,
  oop_call: 45,
  oop_fold: 40,
  oop_raise: 15,
};

// FrequÃªncias ChipEV genÃ©ricas para testes de comportamento
const NEUTRO: ChipEvFreqs = {
  ip_check: 30,
  ip_bet_small: 40,
  ip_bet_large: 30,
  oop_call: 50,
  oop_fold: 35,
  oop_raise: 15,
};

// === CONSERVAÃ‡ÃƒO ===
describe( 'ConservaÃ§Ã£o de frequÃªncias', () => {
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

  test( 'ConservaÃ§Ã£o com aggressionFactor 1.5x', () => {
    const result = solveIcmDistortion( 15, 10, NEUTRO, 1.5 );
    const ip = result.ip.check.center + result.ip.bet_small.center + result.ip.bet_large.center;
    const oop = result.oop.call.center + result.oop.fold.center + result.oop.raise.center;
    expect( ip ).toBeCloseTo( 100, 5 );
    expect( oop ).toBeCloseTo( 100, 5 );
  } );

  test( 'ConservaÃ§Ã£o com RPs extremos', () => {
    const result = solveIcmDistortion( 24, 1, ANCORA, 3 );
    const ip = result.ip.check.center + result.ip.bet_small.center + result.ip.bet_large.center;
    const oop = result.oop.call.center + result.oop.fold.center + result.oop.raise.center;
    expect( ip ).toBeCloseTo( 100, 5 );
    expect( oop ).toBeCloseTo( 100, 5 );
  } );
} );

// === DISTORÃ‡ÃƒO ZERO (Î”RP = 0) ===
describe( 'Î”RP = 0: sem distorÃ§Ã£o nas apostas', () => {
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

// === DIREÃ‡ÃƒO DAS DISTORÃ‡Ã•ES ===
describe( 'DireÃ§Ã£o das distorÃ§Ãµes ICM', () => {
  test( 'Î”RP positivo (IP sob mais pressÃ£o): apostas IP permanecem no ChipEV baseline (OOP-only defense)', () => {
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const pressured = solveIcmDistortion( 20, 10, NEUTRO, 1 );
    expect( pressured.ip.bet_small.center ).toBe( base.ip.bet_small.center );
    expect( pressured.ip.bet_large.center ).toBe( base.ip.bet_large.center );
    expect( pressured.ip.check.center ).toBe( base.ip.check.center );
  } );

  test( 'Î”RP positivo: OOP call cai por risco de ressuscitar o IP', () => {
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const pressured = solveIcmDistortion( 20, 10, NEUTRO, 1 );
    expect( pressured.oop.call.center ).toBeLessThan( base.oop.call.center );
  } );

  test( 'Î”RP negativo (OOP sob mais pressÃ£o): apostas IP permanecem no ChipEV baseline (OOP-only defense)', () => {
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const pressured = solveIcmDistortion( 10, 20, NEUTRO, 1 );
    expect( pressured.ip.bet_small.center ).toBe( base.ip.bet_small.center );
    expect( pressured.ip.bet_large.center ).toBe( base.ip.bet_large.center );
    expect( pressured.ip.check.center ).toBe( base.ip.check.center );
  } );

  test( 'oop_raise usa |Î”RP| sem sign (comprime em ambas as direÃ§Ãµes)', () => {
    // Em ambos os lados, oop_raise deve cair com |Î”RP| crescente (k = -9)
    const base = solveIcmDistortion( 10, 10, NEUTRO, 1 );
    const ipOver = solveIcmDistortion( 20, 10, NEUTRO, 1 );
    const oopOver = solveIcmDistortion( 10, 20, NEUTRO, 1 );
    expect( ipOver.oop.raise.center ).toBeLessThan( base.oop.raise.center );
    expect( oopOver.oop.raise.center ).toBeLessThan( base.oop.raise.center );
  } );
} );

// === AGGRESSION FACTOR ===
describe( 'aggressionFactor', () => {
  test( 'aggressionFactor nÃ£o altera as frequÃªncias do IP (OOP-only defense)', () => {
    const gto = solveIcmDistortion( 15, 10, NEUTRO, 1 );
    const agg = solveIcmDistortion( 15, 10, NEUTRO, 1.5 );
    expect( agg.ip.bet_small.center ).toBe( gto.ip.bet_small.center );
    expect( agg.ip.check.center ).toBe( gto.ip.check.center );
  } );

  test( 'aggressionFactor afeta OOP call indiretamente via contraÃ§Ã£o do raise (SOTA v7.0 GOLD)', () => {
    const gto = solveIcmDistortion( 15, 10, NEUTRO, 1 );
    const agg = solveIcmDistortion( 15, 10, NEUTRO, 1.5 );
    // Em Topologic Aggression 2.0, um maior aggressionFactor eleva o raise, o que comprime o call.
    expect( agg.oop.call.center ).toBeLessThan( gto.oop.call.center );
  } );
} );

// === EXPOENTE b (CURVA CÃ”NCAVA) ===
describe( 'Expoente b (curva cÃ´ncava)', () => {
  test( 'b decresce com maior pressÃ£o ICM (avgRp maior)', () => {
    const low = solveIcmDistortion( 5, 5, NEUTRO, 1 );
    const high = solveIcmDistortion( 20, 20, NEUTRO, 1 );
    expect( high.bExponent ).toBeLessThan( low.bExponent );
  } );

  test( 'b â†’ 1 quando RPs â†’ 0 (ChipEV puro)', () => {
    const result = solveIcmDistortion( 0, 0, NEUTRO, 1 );
    expect( result.bExponent ).toBeCloseTo( 1, 3 );
  } );

  test( 'b > 0 sempre (nunca colapsa)', () => {
    const result = solveIcmDistortion( 24, 24, NEUTRO, 1 );
    expect( result.bExponent ).toBeGreaterThan( 0 );
  } );
} );

// === CLAMPING E SANITIZAÃ‡ÃƒO ===
describe( 'Clamping e sanitizaÃ§Ã£o de inputs', () => {
  test( 'Todas as frequÃªncias ficam entre 0 e 100', () => {
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

  test( 'deltaRp calculado corretamente na Ã¢ncora', () => {
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

