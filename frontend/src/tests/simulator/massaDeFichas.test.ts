/// <reference types="jest" />

/**
 * B03 — CONTRATO DE MASSA DOS RAMOS TERMINAIS
 *
 * `potSize` e dinheiro JA DESTACADO dos stacks: perspectiva.ts:565 calcula a pot
 * odds crua como `heroCost / (potSize + heroCost)`, o que so fecha se o pote nao
 * contiver o call do hero e nao estiver mais nos stacks.
 *
 * Logo todo ramo terminal tem a MESMA massa: `soma(stacks) + potSize`. Alguem
 * recolhe o pote — o hero, o vilao, ou o vilao por desistencia. Nenhum ramo cria
 * nem destroi fichas, e nenhum ramo difere dos outros.
 *
 * Este teste mede o CONTRATO (as tres massas sao iguais e valem total+pot), nunca
 * um valor de BF ou de RP: valor de saida se desloca legitimamente quando o
 * modelo muda, massa nao.
 */

import { buildSimulatedStacks } from '../../lib/perspectiva';

const soma = (xs: number[]) => xs.reduce((s, v) => s + v, 0);

describe('B03 — conservacao de massa entre os ramos terminais', () => {
  const CENARIOS = [
    { nome: 'bolha 4-max, hero medio', stacks: [40, 30, 20, 10], hero: 0, vilao: 1, pot: 20, custo: 10, investido: 4 },
    { nome: 'bolha 3-max, hero short', stacks: [50, 35, 15], hero: 2, vilao: 0, pot: 18, custo: 12, investido: 3 },
    { nome: 'FT 5-max equilibrado', stacks: [30, 25, 20, 15, 10], hero: 1, vilao: 3, pot: 16, custo: 8, investido: 2 },
    { nome: 'sem investimento previo', stacks: [100, 100], hero: 0, vilao: 1, pot: 30, custo: 15, investido: 0 },
  ];

  it.each(CENARIOS)('$nome: os tres ramos tem massa total+pot', ({ stacks, hero, vilao, pot, custo, investido }) => {
    const esperado = soma(stacks) + pot;
    const { stacksWin, stacksLose, stacksFold } = buildSimulatedStacks(stacks, hero, vilao, pot, custo, investido);

    expect(soma(stacksWin)).toBeCloseTo(esperado, 6);
    expect(soma(stacksLose)).toBeCloseTo(esperado, 6);
    expect(soma(stacksFold)).toBeCloseTo(esperado, 6);
  });

  it('hero com stack menor que o custo nao cria fichas ao perder', () => {
    // O clamp em zero do lado do hero, somado ao custo CRU do lado do vilao,
    // fabricava (custo - stack) fichas sempre que o hero estava all-in por menos.
    const stacks = [5, 200, 100];
    const { stacksWin, stacksLose, stacksFold } = buildSimulatedStacks(stacks, 0, 1, 40, 10, 0);
    const esperado = soma(stacks) + 40;

    expect(soma(stacksWin)).toBeCloseTo(esperado, 6);
    expect(soma(stacksLose)).toBeCloseTo(esperado, 6);
    expect(soma(stacksFold)).toBeCloseTo(esperado, 6);
  });

  it('nenhum stack fica negativo', () => {
    const { stacksWin, stacksLose, stacksFold } = buildSimulatedStacks([8, 150], 0, 1, 60, 25, 6);
    for (const ramo of [stacksWin, stacksLose, stacksFold]) {
      for (const s of ramo) expect(s).toBeGreaterThanOrEqual(0);
    }
  });
});
