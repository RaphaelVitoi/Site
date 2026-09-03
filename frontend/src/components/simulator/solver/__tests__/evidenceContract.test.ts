/// <reference types="jest" />

/**
 * TESTE DE CONTRATO: Evidência primária ChipEV × ICMev
 * PATH: src/components/simulator/solver/__tests__/evidenceContract.test.ts
 *
 * Fixtures SINTÉTICAS. Nenhum valor aqui representa saída real de solver;
 * são construções mínimas para exercitar as invariantes estruturais.
 */

import {
  DEFAULT_COMBO_CONSERVATION_TOLERANCE,
  DEFAULT_SIZING_EQUIVALENCE_TOLERANCE_BB,
  DEFAULT_SIZING_EQUIVALENCE_RELATIVE,
  DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT,
  assessReproducibility,
  camposDeProcedenciaFaltando,
  countReproduciblePairs,
  hasBlockingViolation,
  isRead,
  isUnreadable,
  read,
  resolveTolerances,
  unreadable,
  validateEvidencePair,
} from '../evidenceContract';
import type {
  EvidenceAction,
  EvidenceContext,
  EvidencePair,
  EvidenceScenario,
  EvidenceSource,
  EvidenceViolation,
  ENashUnit,
  EvidenceViolationCode,
  SolverProvenance,
} from '../evidenceContract';

// === FIXTURES SINTÉTICAS ===

const SOURCE_SINTETICA: EvidenceSource = {
  documentSha256: 'f'.repeat( 64 ),
  figureIndex: 0,
  nodeLabel: 'NO-SINTETICO-A',
};

const CONTEXTO_SINTETICO: EvidenceContext = {
  street: 'flop',
  board: read( 'XX YY ZZ' ),
  potBb: read( 10 ),
  players: [
    { id: 'JOGADOR-OOP', position: 'OOP', stackBb: read( 100 ) },
    { id: 'JOGADOR-IP', position: 'IP', stackBb: read( 100 ) },
  ],
};

function acao(
  label: string,
  frequencyPct: EvidenceAction[ 'frequencyPct' ],
  extras: Partial<EvidenceAction> = {},
): EvidenceAction {
  return { label, frequencyPct, ...extras };
}

/**
 * Procedência sintética COMPLETA, aplicada por padrão.
 *
 * Os fixtures deste arquivo perguntam sobre INTEGRIDADE do dado — soma de
 * frequência, conservação de combos, ilegível que não vira zero. Deixá-los sem
 * procedência misturaria a essas perguntas a de REPRODUTIBILIDADE, que é outra
 * e tem função própria (`assessReproducibility`). Um teste sobre tolerância de
 * arredondamento não deveria falhar por falta de build de solver.
 *
 * A ausência de procedência é exercitada explicitamente por
 * `cenarioSemProcedencia`, onde essa é a pergunta.
 */
const PROCEDENCIA_SINTETICA: SolverProvenance = {
  build: read( 'SOLVER-SINTETICO build 0.0.0' ),
  eNash: read( 0.15 ),
  eNashUnit: read( 'pctOfPot' ),
};

/** Cenário mínimo de duas ações que fecha exatamente em 100%. */
function cenario(
  regime: EvidenceScenario[ 'regime' ],
  actions: EvidenceAction[],
  totalCombos?: EvidenceScenario[ 'totalCombos' ],
): EvidenceScenario {
  const base: EvidenceScenario = {
    regime,
    solver: regime === 'chipEV' ? 'SOLVER-SINTETICO-A' : 'SOLVER-SINTETICO-B',
    provenance: PROCEDENCIA_SINTETICA,
    actions,
  };
  return totalCombos === undefined ? base : { ...base, totalCombos };
}

/** Mesmo cenário, sem qualquer declaração de procedência. */
function cenarioSemProcedencia(
  regime: EvidenceScenario[ 'regime' ],
  actions: EvidenceAction[],
): EvidenceScenario {
  const base = cenario( regime, actions );
  delete base.provenance;
  return base;
}

function par(
  chipEv: EvidenceScenario,
  icmEv: EvidenceScenario,
): EvidencePair {
  return { source: SOURCE_SINTETICA, context: CONTEXTO_SINTETICO, chipEv, icmEv };
}

/** Par de referência: duas ações espelhadas, 60/40 nos dois regimes. */
function parValido(): EvidencePair {
  return par(
    cenario( 'chipEV', [ acao( 'Check', read( 60 ) ), acao( 'Bet', read( 40 ), { sizingBb: read( 5 ) } ) ] ),
    cenario( 'icmEV', [ acao( 'Check', read( 70 ) ), acao( 'Bet', read( 30 ), { sizingBb: read( 5 ) } ) ] ),
  );
}

function codes( violations: EvidenceViolation[] ): EvidenceViolationCode[] {
  return violations.map( v => v.code );
}

function has( violations: EvidenceViolation[], code: EvidenceViolationCode ): boolean {
  return codes( violations ).includes( code );
}

// === PAR VÁLIDO ===
describe( 'Par válido', () => {
  test( 'não produz nenhuma violação', () => {
    const violations = validateEvidencePair( parValido() );
    expect( violations ).toEqual( [] );
    expect( hasBlockingViolation( violations ) ).toBe( false );
  } );

  test( 'par válido com combos conservados não produz violação', () => {
    const p = par(
      cenario(
        'chipEV',
        [
          acao( 'Check', read( 50 ), { combos: read( 100 ) } ),
          acao( 'Bet', read( 50 ), { combos: read( 100 ), sizingBb: read( 4 ) } ),
        ],
        read( 200 ),
      ),
      cenario(
        'icmEV',
        [
          acao( 'Check', read( 75 ), { combos: read( 150 ) } ),
          acao( 'Bet', read( 25 ), { combos: read( 50 ), sizingBb: read( 4 ) } ),
        ],
        read( 200 ),
      ),
    );
    expect( validateEvidencePair( p ) ).toEqual( [] );
  } );
} );

// === VALORES NÃO-FINITOS ===
describe( 'Valores não-finitos', () => {
  test( 'NaN em frequência é rejeitado', () => {
    const p = parValido();
    p.chipEv.actions[ 0 ].frequencyPct = read( Number.NaN );
    const violations = validateEvidencePair( p );
    expect( has( violations, 'NON_FINITE_NUMBER' ) ).toBe( true );
    expect( hasBlockingViolation( violations ) ).toBe( true );
  } );

  test( 'Infinity em sizing é rejeitado', () => {
    const p = parValido();
    p.icmEv.actions[ 1 ].sizingBb = read( Number.POSITIVE_INFINITY );
    const violations = validateEvidencePair( p );
    const naoFinito = violations.filter( v => v.code === 'NON_FINITE_NUMBER' );
    expect( naoFinito ).toHaveLength( 1 );
    expect( naoFinito[ 0 ].path ).toBe( 'icmEv.actions[1].sizingBb' );
  } );

  test( '-Infinity no pote é rejeitado', () => {
    const p = parValido();
    p.context = { ...CONTEXTO_SINTETICO, potBb: read( Number.NEGATIVE_INFINITY ) };
    const violations = validateEvidencePair( p );
    expect( has( violations, 'NON_FINITE_NUMBER' ) ).toBe( true );
  } );

  test( 'frequência não-finita NÃO entra na soma como zero', () => {
    const p = parValido();
    p.chipEv.actions[ 0 ].frequencyPct = read( Number.NaN );
    const violations = validateEvidencePair( p );
    // Se NaN virasse 0, a soma seria 40 e apareceria FREQUENCY_SUM_MISMATCH.
    expect( has( violations, 'FREQUENCY_SUM_MISMATCH' ) ).toBe( false );
    expect( has( violations, 'FREQUENCY_SUM_UNVERIFIABLE' ) ).toBe( true );
  } );
} );

// === FAIXA DE FREQUÊNCIA ===
describe( 'Faixa de frequência [0, 100]', () => {
  test( 'frequência negativa é rejeitada', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( -10 ) ), acao( 'Bet', read( 110 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet', read( 50 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    const fora = violations.filter( v => v.code === 'FREQUENCY_OUT_OF_RANGE' );
    expect( fora ).toHaveLength( 2 );
    expect( fora[ 0 ].path ).toBe( 'chipEv.actions[0].frequencyPct' );
  } );

  test( 'frequência acima de 100 é rejeitada mesmo com soma fechando', () => {
    // 120 + (-20) = 100: a soma fecha, mas os valores individuais são ilegais.
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 120 ) ), acao( 'Bet', read( -20 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet', read( 50 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    expect( violations.filter( v => v.code === 'FREQUENCY_OUT_OF_RANGE' ) ).toHaveLength( 2 );
    expect( has( violations, 'FREQUENCY_SUM_MISMATCH' ) ).toBe( false );
  } );

  test( '0 e 100 são valores legais nas bordas', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 100 ) ), acao( 'Bet', read( 0 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 0 ) ), acao( 'Bet', read( 100 ) ) ] ),
    );
    expect( validateEvidencePair( p ) ).toEqual( [] );
  } );
} );

// === TOLERÂNCIA DECLARADA DA SOMA ===
describe( 'Tolerância declarada da soma de frequências', () => {
  test( 'soma de 100.1% é ACEITA sob a tolerância padrão', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 60.1 ) ), acao( 'Bet', read( 40 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 70 ) ), acao( 'Bet', read( 30 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    expect( has( violations, 'FREQUENCY_SUM_MISMATCH' ) ).toBe( false );
    expect( violations ).toEqual( [] );
  } );

  test( 'soma de 105% é REJEITADA sob a tolerância padrão', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 65 ) ), acao( 'Bet', read( 40 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 70 ) ), acao( 'Bet', read( 30 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    const mismatch = violations.filter( v => v.code === 'FREQUENCY_SUM_MISMATCH' );
    expect( mismatch ).toHaveLength( 1 );
    expect( mismatch[ 0 ].severity ).toBe( 'error' );
    expect( mismatch[ 0 ].details ).toMatchObject( {
      sumPct: 105,
      tolerancePct: DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT,
    } );
  } );

  test( 'tolerância é parâmetro explícito: 100.1% reprova sob tolerância 0', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 60.1 ) ), acao( 'Bet', read( 40 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 70 ) ), acao( 'Bet', read( 30 ) ) ] ),
    );
    const violations = validateEvidencePair( p, { frequencySumTolerancePct: 0 } );
    expect( has( violations, 'FREQUENCY_SUM_MISMATCH' ) ).toBe( true );
  } );

  test( 'o validador NÃO redistribui: o par de entrada permanece intacto', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 65 ) ), acao( 'Bet', read( 40 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 70 ) ), acao( 'Bet', read( 30 ) ) ] ),
    );
    validateEvidencePair( p );
    expect( p.chipEv.actions[ 0 ].frequencyPct ).toEqual( read( 65 ) );
    expect( p.chipEv.actions[ 1 ].frequencyPct ).toEqual( read( 40 ) );
  } );

  test( 'resolveTolerances devolve os padrões documentados', () => {
    expect( resolveTolerances() ).toEqual( {
      frequencySumTolerancePct: DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT,
      comboConservationTolerance: DEFAULT_COMBO_CONSERVATION_TOLERANCE,
      sizingEquivalenceToleranceBb: DEFAULT_SIZING_EQUIVALENCE_TOLERANCE_BB,
      sizingEquivalenceRelative: DEFAULT_SIZING_EQUIVALENCE_RELATIVE,
    } );
  } );
} );

// === CONSERVAÇÃO DE COMBOS ===
describe( 'Conservação de combos', () => {
  test( 'soma de combos divergente do total é detectada', () => {
    const p = par(
      cenario(
        'chipEV',
        [
          acao( 'Check', read( 50 ), { combos: read( 100 ) } ),
          acao( 'Bet', read( 50 ), { combos: read( 60 ) } ),
        ],
        read( 200 ),
      ),
      cenario( 'icmEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet', read( 50 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    const quebra = violations.filter( v => v.code === 'COMBO_CONSERVATION_MISMATCH' );
    expect( quebra ).toHaveLength( 1 );
    expect( quebra[ 0 ].severity ).toBe( 'error' );
    expect( quebra[ 0 ].details ).toMatchObject( {
      actionComboSum: 160,
      totalCombos: 200,
      tolerance: DEFAULT_COMBO_CONSERVATION_TOLERANCE,
    } );
  } );

  test( 'divergência dentro da tolerância de arredondamento é aceita', () => {
    const p = par(
      cenario(
        'chipEV',
        [
          acao( 'Check', read( 50 ), { combos: read( 100.2 ) } ),
          acao( 'Bet', read( 50 ), { combos: read( 100 ) } ),
        ],
        read( 200 ),
      ),
      cenario( 'icmEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet', read( 50 ) ) ] ),
    );
    expect( validateEvidencePair( p ) ).toEqual( [] );
  } );

  test( 'combo ilegível não fecha o circuito: reportado como não verificável', () => {
    const p = par(
      cenario(
        'chipEV',
        [
          acao( 'Check', read( 50 ), { combos: read( 100 ) } ),
          acao( 'Bet', read( 50 ), { combos: unreadable( 'coluna cortada' ) } ),
        ],
        read( 200 ),
      ),
      cenario( 'icmEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet', read( 50 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    expect( has( violations, 'COMBO_CONSERVATION_UNVERIFIABLE' ) ).toBe( true );
    // Combo ilegível NÃO é somado como zero — nada de MISMATCH fabricado.
    expect( has( violations, 'COMBO_CONSERVATION_MISMATCH' ) ).toBe( false );
    expect( hasBlockingViolation( violations ) ).toBe( false );
  } );
} );

// === CARDINALIDADE / COMPARABILIDADE ===
describe( 'Cardinalidade incompatível entre os cenários', () => {
  test( 'contagens diferentes de ações são SINALIZADAS', () => {
    /*
     * Nó em que se pode pedir mesa: um lado oferece uma sizing de aposta, o
     * outro oferece duas. É a forma do par 4 da Aula 1.2.
     *
     * A versão anterior deste caso usava `[Check, Bet, Raise]` de um lado. Isso
     * não é nó legal de pôquer — não se aumenta onde se pode pedir mesa —, e
     * desde `classifyActionNoCenario` aquele `Raise` normaliza para `bet`. O
     * caso foi reescrito para um nó legal em vez de ter sua expectativa
     * ajustada ao novo comportamento: teste que só acompanha a implementação
     * não verifica nada.
     */
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet 50%', read( 50 ) ) ] ),
      cenario( 'icmEV', [
        acao( 'Check', read( 40 ) ),
        acao( 'Bet 50%', read( 40 ) ),
        acao( 'Bet 75%', read( 20 ) ),
      ] ),
    );
    const violations = validateEvidencePair( p );
    const sinal = violations.filter( v => v.code === 'ACTION_SET_INCOMPARABLE' );
    expect( sinal ).toHaveLength( 1 );
    // SINALIZADO, e deliberadamente NÃO bloqueante: ChipEV e ICMev são modelos
    // essencialmente distintos e não precisam oferecer as mesmas ações. A
    // divergência é restrição do solver, não defeito do dado.
    expect( sinal[ 0 ].severity ).toBe( 'warning' );
    expect( sinal[ 0 ].details ).toMatchObject( {
      classesDivergentes: [ 'bet' ],
    } );
  } );

  test( 'classe `raise` presente num só lado é sinalizada — em nó onde raise é legal', () => {
    /*
     * Diante de aposta pendente (o cenário oferece fold e call, não check), um
     * `Raise` continua sendo `raise`. A normalização de all-in/raise para bet
     * vale SÓ onde pedir mesa é opção; não é global.
     */
    const p = par(
      cenario( 'chipEV', [ acao( 'Fold', read( 30 ) ), acao( 'Call', read( 70 ) ) ] ),
      cenario( 'icmEV', [
        acao( 'Fold', read( 30 ) ),
        acao( 'Call', read( 60 ) ),
        acao( 'Raise', read( 10 ) ),
      ] ),
    );
    const sinal = validateEvidencePair( p )
      .filter( v => v.code === 'ACTION_SET_INCOMPARABLE' );
    expect( sinal ).toHaveLength( 1 );
    expect( sinal[ 0 ].severity ).toBe( 'warning' );
    expect( sinal[ 0 ].details ).toMatchObject( {
      classesDivergentes: [ 'raise' ],
    } );
  } );

  test( 'mesma contagem com rótulos divergentes também é sinalizada', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet 33%', read( 50 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet 75%', read( 50 ) ) ] ),
    );
    expect( has( validateEvidencePair( p ), 'ACTION_SET_INCOMPARABLE' ) ).toBe( true );
  } );

  test( 'ordem diferente dos mesmos rótulos NÃO é incompatibilidade', () => {
    const p = par(
      cenario( 'chipEV', [ acao( 'Check', read( 50 ) ), acao( 'Bet', read( 50 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Bet', read( 30 ) ), acao( 'Check', read( 70 ) ) ] ),
    );
    expect( has( validateEvidencePair( p ), 'ACTION_SET_INCOMPARABLE' ) ).toBe( false );
  } );

  test( 'cenário vazio é rejeitado', () => {
    const p = par(
      cenario( 'chipEV', [] ),
      cenario( 'icmEV', [ acao( 'Check', read( 100 ) ) ] ),
    );
    expect( has( validateEvidencePair( p ), 'EMPTY_ACTION_SET' ) ).toBe( true );
  } );
} );

// === ILEGÍVEL ≠ ZERO ===
describe( 'Campo ilegível não é confundido com zero', () => {
  test( 'frequência ilegível não vira 0 na soma', () => {
    const p = par(
      cenario( 'chipEV', [
        acao( 'Check', read( 60 ) ),
        acao( 'Bet', unreadable( 'rótulo borrado' ) ),
      ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 70 ) ), acao( 'Bet', read( 30 ) ) ] ),
    );
    const violations = validateEvidencePair( p );
    // Com ilegível=0 a soma seria 60 e dispararia MISMATCH. Isso seria mentira.
    expect( has( violations, 'FREQUENCY_SUM_MISMATCH' ) ).toBe( false );
    const naoVerificavel = violations.filter( v => v.code === 'FREQUENCY_SUM_UNVERIFIABLE' );
    expect( naoVerificavel ).toHaveLength( 1 );
    expect( naoVerificavel[ 0 ].severity ).toBe( 'warning' );
    expect( naoVerificavel[ 0 ].details ).toMatchObject( {
      readableSumPct: 60,
      unreadableCount: 1,
    } );
  } );

  test( 'frequência lida como 0 é fato diferente de frequência ilegível', () => {
    const lidoZero = par(
      cenario( 'chipEV', [ acao( 'Check', read( 100 ) ), acao( 'Bet', read( 0 ) ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 100 ) ), acao( 'Bet', read( 0 ) ) ] ),
    );
    const ilegivel = par(
      cenario( 'chipEV', [ acao( 'Check', read( 100 ) ), acao( 'Bet', unreadable() ) ] ),
      cenario( 'icmEV', [ acao( 'Check', read( 100 ) ), acao( 'Bet', read( 0 ) ) ] ),
    );
    expect( validateEvidencePair( lidoZero ) ).toEqual( [] );
    expect( has( validateEvidencePair( ilegivel ), 'FREQUENCY_SUM_UNVERIFIABLE' ) ).toBe( true );
  } );

  test( 'os construtores produzem estados distinguíveis em tempo de execução', () => {
    expect( isUnreadable( unreadable() ) ).toBe( true );
    expect( isUnreadable( read( 0 ) ) ).toBe( false );
    expect( read( 0 ) ).not.toEqual( unreadable() );
  } );

  test( 'stack ilegível não gera violação de valor', () => {
    const p = parValido();
    p.context = {
      ...CONTEXTO_SINTETICO,
      players: [
        { id: 'JOGADOR-OOP', position: 'OOP', stackBb: unreadable( 'HUD sobreposto' ) },
        { id: 'JOGADOR-IP', position: 'IP', stackBb: read( 100 ) },
      ],
    };
    expect( validateEvidencePair( p ) ).toEqual( [] );
  } );
} );

// === CONTEXTO ===
describe( 'Contexto do spot', () => {
  test( 'ausência de OOP ou IP é rejeitada', () => {
    const p = parValido();
    p.context = {
      ...CONTEXTO_SINTETICO,
      players: [ { id: 'JOGADOR-IP', position: 'IP', stackBb: read( 100 ) } ],
    };
    const violations = validateEvidencePair( p );
    expect( has( violations, 'INVALID_PLAYER_SET' ) ).toBe( true );
  } );
} );

// === PROCEDÊNCIA E REPRODUTIBILIDADE ===
describe( 'Procedência do solve', () => {
  test( 'par com build e e-Nash nos dois lados é reproduzível', () => {
    const avaliacao = assessReproducibility( parValido() );
    expect( avaliacao.reproducible ).toBe( true );
    expect( avaliacao.missing ).toEqual( { chipEv: [], icmEv: [] } );
  } );

  test( 'par sem procedência não é reproduzível, e o motivo é nomeado', () => {
    const semNada = par(
      cenarioSemProcedencia( 'chipEV', [ acao( 'Check', read( 100 ) ) ] ),
      cenarioSemProcedencia( 'icmEV', [ acao( 'Check', read( 100 ) ) ] ),
    );
    const avaliacao = assessReproducibility( semNada );
    expect( avaliacao.reproducible ).toBe( false );
    expect( avaliacao.missing.chipEv ).toEqual( [ 'provenance' ] );
    expect( avaliacao.missing.icmEv ).toEqual( [ 'provenance' ] );
  } );

  test( 'procedência num lado só NÃO basta: reprodutibilidade é do par', () => {
    const meioTermo = par(
      cenario( 'chipEV', [ acao( 'Check', read( 100 ) ) ] ),
      cenarioSemProcedencia( 'icmEV', [ acao( 'Check', read( 100 ) ) ] ),
    );
    const avaliacao = assessReproducibility( meioTermo );
    expect( avaliacao.reproducible ).toBe( false );
    expect( avaliacao.missing.chipEv ).toEqual( [] );
    expect( avaliacao.missing.icmEv ).toEqual( [ 'provenance' ] );
  } );

  test( 'e-Nash lido SEM unidade não se interpreta: falta eNashUnit', () => {
    /*
     * 0.4 é "0,4% do pote" (solve apertado) ou "0,4bb" (solve grosseiro)?
     * O número sozinho não decide, e adotar uma unidade padrão transformaria
     * a ambiguidade em número confiável.
     */
    const semUnidade = cenario( 'chipEV', [ acao( 'Check', read( 100 ) ) ] );
    semUnidade.provenance = { build: read( 'X v1' ), eNash: read( 0.4 ) };
    expect( camposDeProcedenciaFaltando( semUnidade ) ).toEqual( [ 'eNashUnit' ] );
  } );

  test( 'e-Nash ILEGÍVEL não é e-Nash zero', () => {
    /*
     * e-Nash 0 é convergência perfeita — a afirmação mais forte possível sobre
     * um solve. Ilegível é ignorância. Colapsá-los alegaria convergência que
     * ninguém observou.
     */
    const ilegivel = cenario( 'chipEV', [ acao( 'Check', read( 100 ) ) ] );
    ilegivel.provenance = {
      build: read( 'X v1' ),
      eNash: unreadable( 'painel fora do recorte' ),
    };
    expect( camposDeProcedenciaFaltando( ilegivel ) ).toEqual( [ 'eNash' ] );

    const convergido = cenario( 'chipEV', [ acao( 'Check', read( 100 ) ) ] );
    convergido.provenance = {
      build: read( 'X v1' ),
      eNash: read( 0 ),
      eNashUnit: read( 'pctOfPot' ),
    };
    expect( camposDeProcedenciaFaltando( convergido ) ).toEqual( [] );
  } );

  test( 'procedência incompleta é WARNING, não descarta o par', () => {
    const semNada = par(
      cenarioSemProcedencia( 'chipEV', [ acao( 'Check', read( 100 ) ) ] ),
      cenarioSemProcedencia( 'icmEV', [ acao( 'Check', read( 100 ) ) ] ),
    );
    const violations = validateEvidencePair( semNada );
    const procedencia = violations.filter( v => v.code === 'PROVENANCE_INCOMPLETE' );
    expect( procedencia ).toHaveLength( 2 );
    for ( const v of procedencia ) expect( v.severity ).toBe( 'warning' );
    expect( hasBlockingViolation( violations ) ).toBe( false );
  } );

  test( 'a contagem do ledger conta reprodutíveis, não válidos', () => {
    const reproduzivel = parValido();
    const apenasValido = par(
      cenarioSemProcedencia( 'chipEV', [ acao( 'Check', read( 100 ) ) ] ),
      cenarioSemProcedencia( 'icmEV', [ acao( 'Check', read( 100 ) ) ] ),
    );
    // Os dois são válidos; só um é reproduzível.
    expect( hasBlockingViolation( validateEvidencePair( apenasValido ) ) ).toBe( false );
    expect( countReproduciblePairs( [ reproduzivel, apenasValido ] ) ).toBe( 1 );
  } );

  test( 'o tipo de procedência aceita as unidades declaradas', () => {
    const p: SolverProvenance = {
      build: read( 'HoldemResources Calculator Pro Export v2.4.1' ),
      eNash: read( 0.12 ),
      eNashUnit: read( 'bbPer100' ),
    };
    expect( isUnreadable( p.build ) ).toBe( false );
  } );
} );

describe( 'O rótulo nativo da distância ao Nash', () => {
  test( 'o rótulo NÃO entra na completude: build já ancora o solver', () => {
    /*
     * e-Nash é o conceito; `CI` no HRC, `MES` no PioSOLVER. O rótulo é
     * derivável de qual solver produziu o solve, e `build` já o ancora. Exigi-lo
     * elevaria a barreira sem acrescentar informação.
     */
    const semRotulo = cenario( 'chipEV', [ acao( 'Check', read( 100 ) ) ] );
    semRotulo.provenance = {
      build: read( 'HRC v2.4.1' ),
      eNash: read( 0.28 ),
      eNashUnit: read( 'pct' ),
    };
    expect( camposDeProcedenciaFaltando( semRotulo ) ).toEqual( [] );
  } );

  test( 'o rótulo é preservado quando lido, para auditoria', () => {
    const comRotulo = cenario( 'icmEV', [ acao( 'Check', read( 100 ) ) ] );
    comRotulo.provenance = {
      build: read( 'HRC v2.4.1' ),
      eNash: read( 0.28 ),
      eNashUnit: read( 'pct' ),
      eNashLabel: read( 'CI' ),
    };
    const rotulo = comRotulo.provenance.eNashLabel;
    expect( rotulo !== undefined && isRead( rotulo ) ? rotulo.value : null ).toBe( 'CI' );
    expect( camposDeProcedenciaFaltando( comRotulo ) ).toEqual( [] );
  } );

  test( '`pct` e `pctOfPot` são unidades DIFERENTES, e a distinção é o ponto', () => {
    /*
     * Ler `%` na tela autoriza dizer que a grandeza é percentual, e nada além.
     * "Por cento de quê" é decidido pelo atalho de convergência do solver — no
     * HRC, proprietário. `pctOfPot` afirma um referente que o símbolo não dá.
     */
    const percentual: ENashUnit = 'pct';
    const doPote: ENashUnit = 'pctOfPot';
    expect( percentual ).not.toBe( doPote );
  } );
} );

describe( 'Motor efetivo × produto', () => {
  test( 'engine não entra na completude, e motor comum é controle e não suspeita', () => {
    /*
     * A disputa em estudo é ChipEV × ICMev. O HRC calcula os dois regimes, então
     * um par com o MESMO motor dos dois lados isola exatamente a variável de
     * interesse. Motores diferentes é que misturam efeito de regime com efeito
     * de motor.
     */
    const semEngine = cenario( 'chipEV', [ acao( 'Check', read( 100 ) ) ] );
    semEngine.provenance = {
      build: read( 'HRC v2.4.1' ),
      eNash: read( 0.2 ),
      eNashUnit: read( 'bb' ),
    };
    expect( camposDeProcedenciaFaltando( semEngine ) ).toEqual( [] );

    const mesmoMotorNosDoisLados = par(
      { ...semEngine, provenance: { ...semEngine.provenance, engine: read( 'HRC' ) } },
      {
        ...cenario( 'icmEV', [ acao( 'Check', read( 100 ) ) ] ),
        provenance: {
          build: read( 'HRC v2.4.1' ),
          engine: read( 'HRC' ),
          eNash: read( 0.2 ),
          eNashUnit: read( 'bb' ),
        },
      },
    );
    expect( assessReproducibility( mesmoMotorNosDoisLados ).reproducible ).toBe( true );
    expect( hasBlockingViolation( validateEvidencePair( mesmoMotorNosDoisLados ) ) ).toBe( false );
  } );
} );
