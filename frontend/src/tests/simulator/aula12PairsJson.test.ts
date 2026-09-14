/**
 * O espelho JSON dos pares da Aula 1.2 é idêntico ao fixture curado.
 *
 * O motor Python lê `data/aula12_pairs.json` (item 4 da ordem vinculante do
 * handoff-2026-09-13-integracao-paralela-pmev-engines). Sem este teste, os dois
 * lados teriam cópias dos mesmos números sem nada que acusasse divergência.
 * Regenerar: script de geração que transpila `aula12Pairs.ts`; nunca editar o JSON.
 */

import espelho from '../../../../data/aula12_pairs.json';
import * as fixture from '../../components/simulator/solver/__fixtures__/aula12Pairs';

const exportados = fixture as unknown as Record<string, unknown>;

describe('espelho JSON dos pares da Aula 1.2', () => {
  it('traz os mesmos pares, na mesma ordem e com os mesmos valores do fixture', () => {
    const esperado = fixture.AULA_1_2_PAIRS.map(par => ({
      chave: Object.keys(exportados).find(k => k.startsWith('PAR_') && exportados[k] === par),
      par: JSON.parse(JSON.stringify(par)),
    }));
    expect(espelho.pares).toEqual(esperado);
  });

  it('declara o mesmo documento e a mesma ambiguidade de nodelock', () => {
    expect(espelho.documentSha256).toBe(fixture.AULA_1_2_SHA256);
    expect(espelho.atribuicaoAmbiguaNodelock).toEqual([
      ...fixture.ATRIBUICAO_AMBIGUA_NODELOCK.afetaPares,
    ]);
  });
});
