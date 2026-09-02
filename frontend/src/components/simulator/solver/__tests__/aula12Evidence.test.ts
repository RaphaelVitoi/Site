/**
 * Integração: o contrato de evidência contra os dados REAIS da Aula 1.2.
 *
 * Estes testes existem porque "módulo que ninguém importa não é integração"
 * (CLAUDE.md §4). O contrato foi escrito contra fixtures sintéticas; aqui ele
 * encontra as três transcrições reais, em dupla leitura cega, e precisa
 * discriminar entre um par legitimamente comparável e um par que não é.
 */

import {
  validateEvidencePair,
  hasBlockingViolation,
  DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT,
  isRead,
  isUnreadable,
  type EvidenceViolationCode,
} from '../evidenceContract';
import {
  AULA_1_2_PAIRS,
  PAR_1_BB_LEADING,
  PAR_2_IP_APOS_CHECK,
  PAR_3_IP_VS_CBET_TURN,
  ESCOPO_PRIMEIRO_CORTE,
  RANGES_PREFLOP,
  MESA_COMPLETA_NO_OPEN,
  BOARD_ATE_O_RIVER,
} from '../__fixtures__/aula12Pairs';

const codes = ( vs: { code: EvidenceViolationCode }[] ): EvidenceViolationCode[] =>
  vs.map( v => v.code );

describe( 'Aula 1.2 — escopo e contexto pré-flop', () => {
  it( 'todos os pares estão dentro do escopo: pós-flop após o call do BB', () => {
    expect( ESCOPO_PRIMEIRO_CORTE.sbNoEscopo ).toBe( false );
    for ( const par of AULA_1_2_PAIRS ) {
      // Nenhum nó é preflop, e o board de cada par é prefixo do board completo.
      expect( par.context.street ).not.toBe( 'preflop' );
      const board = par.context.board;
      expect( isRead( board ) ).toBe( true );
      if ( isRead( board ) ) {
        expect( BOARD_ATE_O_RIVER.startsWith( board.value ) ).toBe( true );
      }
      // Heads-up: exatamente BB e BTN. O SB não é sujeito de nenhum nó.
      const ids = par.context.players.map( p => p.id ).sort();
      expect( ids ).toEqual( [ 'BB', 'BTN' ] );
    }
  } );

  it( 'os ranges pré-flop valem para os DOIS regimes — variável confundidora eliminada', () => {
    /*
     * Se os ranges de entrada fossem diferentes entre ChipEV e ICMev, nenhuma
     * diferença pós-flop poderia ser atribuída ao regime. Como são idênticos
     * por construção, a comparação tem sentido.
     */
    expect( RANGES_PREFLOP.aplicaSeAAmbosOsRegimes ).toBe( true );
    expect( RANGES_PREFLOP.btnRfi.somaPct ).toBeCloseTo( 100, 5 );
  } );

  it( 'o shove do BB confirma a stack efetiva por caminho independente', () => {
    // Um shove é limitado pela stack menor. O BB shova 39.88bb, que é
    // exatamente a stack do BU no Table Draw — duas fontes, mesmo número.
    expect( RANGES_PREFLOP.bbDefense.shove.sizingBb ).toBe(
      MESA_COMPLETA_NO_OPEN.assentos.BU,
    );
    expect( MESA_COMPLETA_NO_OPEN.efetivaPreOpenBb ).toBe( 39.88 );
  } );

  it( 'a defesa do BB soma 100.1% e NÃO é normalizada', () => {
    // Mesmo arredondamento de exibição do par 2, noutro painel e noutro
    // solver: o padrão é da fonte, não um caso isolado.
    expect( RANGES_PREFLOP.bbDefense.somaPct ).toBeCloseTo( 100.1, 5 );
    const soma =
      RANGES_PREFLOP.bbDefense.foldPct +
      RANGES_PREFLOP.bbDefense.callPct +
      RANGES_PREFLOP.bbDefense.treebetSmall.pct +
      RANGES_PREFLOP.bbDefense.treebetPolar.pct +
      RANGES_PREFLOP.bbDefense.shove.pct;
    expect( soma ).toBeCloseTo( 100.1, 5 );
  } );
} );

describe( 'Aula 1.2 — integridade das transcrições', () => {
  it( 'os três pares carregam o mesmo SHA-256 da fonte', () => {
    const shas = new Set( AULA_1_2_PAIRS.map( p => p.source.documentSha256 ) );
    expect( shas.size ).toBe( 1 );
    expect( [ ...shas ][ 0 ] ).toMatch( /^[0-9a-f]{64}$/ );
  } );

  it( 'nenhum par apresenta valor não-finito nem frequência fora de faixa', () => {
    for ( const par of AULA_1_2_PAIRS ) {
      const encontrados = codes( validateEvidencePair( par ) );
      expect( encontrados ).not.toContain( 'NON_FINITE_NUMBER' );
      expect( encontrados ).not.toContain( 'FREQUENCY_OUT_OF_RANGE' );
      expect( encontrados ).not.toContain( 'INVALID_PLAYER_SET' );
    }
  } );
} );

describe( 'Aula 1.2 — o lado ICMev é honestamente incompleto', () => {
  it( 'combos do HRC são ilegíveis, e ilegível não é zero', () => {
    for ( const par of AULA_1_2_PAIRS ) {
      for ( const acao of par.icmEv.actions ) {
        expect( acao.combos ).toBeDefined();
        expect( isUnreadable( acao.combos! ) ).toBe( true );
        expect( isRead( acao.combos! ) ).toBe( false );
      }
    }
  } );

  it( 'a conservação de combos do ICMev é reportada como NÃO VERIFICÁVEL, não como violada', () => {
    const encontrados = codes( validateEvidencePair( PAR_1_BB_LEADING ) );
    expect( encontrados ).toContain( 'COMBO_CONSERVATION_UNVERIFIABLE' );
    expect( encontrados ).not.toContain( 'COMBO_CONSERVATION_MISMATCH' );
  } );
} );

describe( 'Aula 1.2 — conservação de combos do lado ChipEV', () => {
  // 752.61 + 0.22 = 752.83 vs 752.8 declarado
  // 24.4 + 306.02 + 32.14 + 8.38 = 370.94 vs 370.9 declarado
  // 61.32 + 188.36 + 0.01 + 2.27 = 251.96 vs 252 declarado
  it.each( [
    [ 'par 1', PAR_1_BB_LEADING ],
    [ 'par 2', PAR_2_IP_APOS_CHECK ],
    [ 'par 3', PAR_3_IP_VS_CBET_TURN ],
  ] )( '%s: os combos do ChipEV fecham dentro da tolerância', ( _nome, par ) => {
    const encontrados = codes( validateEvidencePair( par ) )
      .filter( c => c === 'COMBO_CONSERVATION_MISMATCH' );
    expect( encontrados ).toHaveLength( 0 );
  } );
} );

describe( 'Aula 1.2 — a soma 100.1% do par 2 é real e não se normaliza', () => {
  it( 'passa sob a tolerância padrão', () => {
    const encontrados = codes( validateEvidencePair( PAR_2_IP_APOS_CHECK ) );
    expect( encontrados ).not.toContain( 'FREQUENCY_SUM_MISMATCH' );
    expect( DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT ).toBeGreaterThan( 0.1 );
  } );

  it( 'reprova com tolerância zero — a folga é escolha declarada, não acaso', () => {
    const encontrados = codes(
      validateEvidencePair( PAR_2_IP_APOS_CHECK, { frequencySumTolerancePct: 0 } ),
    );
    expect( encontrados ).toContain( 'FREQUENCY_SUM_MISMATCH' );
  } );

  it( 'a validação não muta a fixture', () => {
    const antes = JSON.stringify( PAR_2_IP_APOS_CHECK );
    validateEvidencePair( PAR_2_IP_APOS_CHECK, { frequencySumTolerancePct: 0 } );
    expect( JSON.stringify( PAR_2_IP_APOS_CHECK ) ).toBe( antes );
  } );
} );

describe( 'Aula 1.2 — comparabilidade: a regra precisa DISCRIMINAR', () => {
  /*
   * Este é o coração da integração. Os dois solvers jamais usam a mesma
   * nomenclatura: o GTO Wizard escreve 'Check' e 'Bet 1.4 (25%)', o HRC
   * escreve 'checks' e 'bets 1.41bb'. Uma regra de comparabilidade baseada em
   * rótulo literal reprovaria TODOS os pares e não discriminaria nada.
   *
   * O que decide comparabilidade é a ÁRVORE: mesma classe de ação e mesmo
   * sizing efetivo. Nos pares 1 e 2 as árvores coincidem (20/50/75% do pote
   * batem com 1.13 / 2.81 / 4.22 bb). No par 3 NÃO coincidem: o ChipEV oferece
   * raise 23.4 e allin 35; o ICMev oferece 17.44 e 32.81.
   */

  it( 'par 1 é comparável: mesma árvore, sizings equivalentes (1.4 ≈ 1.41)', () => {
    const encontrados = codes( validateEvidencePair( PAR_1_BB_LEADING ) );
    expect( encontrados ).not.toContain( 'ACTION_SET_INCOMPARABLE' );
  } );

  it( 'par 2 é comparável: 20/50/75% do pote ≡ 1.13 / 2.81 / 4.22 bb', () => {
    const encontrados = codes( validateEvidencePair( PAR_2_IP_APOS_CHECK ) );
    expect( encontrados ).not.toContain( 'ACTION_SET_INCOMPARABLE' );
  } );

  it( 'par 3: sizings de raise divergem, e isso é RESTRIÇÃO DO SOLVER, não erro', () => {
    /*
     * ChipEV oferece raise 23.4 e allin 35; ICMev oferece 17.44 e 32.81. As
     * classes de ação correspondem (a árvore de referência é a mesma: Bet
     * 20/50/75%, Raise 50%, all-in a partir de SPR 5), mas os valores em bb
     * divergem porque o GTO Wizard modela stack efetiva 40/40 e o HRC modela
     * as stacks reais 39.88/53.88 — potes diferentes no mesmo ramo.
     *
     * ChipEV e ICMev são modelos essencialmente distintos. Divergência entre
     * eles é fato observado sobre a árvore de cada motor, e o par continua
     * sendo evidência legítima: NÃO pode ser bloqueante.
     */
    const violacoes = validateEvidencePair( PAR_3_IP_VS_CBET_TURN );
    const encontrados = codes( violacoes );
    expect( encontrados ).toContain( 'SIZING_CORRESPONDENCE_UNVERIFIABLE' );
    expect( hasBlockingViolation( violacoes ) ).toBe( false );
  } );

  it( 'nenhuma divergência entre solvers é tratada como erro bloqueante', () => {
    for ( const par of AULA_1_2_PAIRS ) {
      const violacoes = validateEvidencePair( par );
      const bloqueantes = violacoes.filter( v => v.severity === 'error' );
      expect( bloqueantes ).toHaveLength( 0 );
    }
  } );

  it( 'um "fold" a 0% presente só no HRC não torna o par incomparável', () => {
    // Fold não é opção legal quando não há aposta pendente: o GTO Wizard o
    // omite, o HRC o lista a 0%. Isso é diferença de exibição, não de árvore.
    const chipLabels = PAR_1_BB_LEADING.chipEv.actions.map( a => a.label );
    const icmLabels = PAR_1_BB_LEADING.icmEv.actions.map( a => a.label );
    expect( chipLabels ).not.toContain( 'Fold' );
    expect( icmLabels ).toContain( 'folds' );
    expect( codes( validateEvidencePair( PAR_1_BB_LEADING ) ) )
      .not.toContain( 'ACTION_SET_INCOMPARABLE' );
  } );
} );

describe( 'Aula 1.2 — o que a evidência NÃO autoriza', () => {
  it( 'os três pares são evidência válida: nenhum é descartado por divergir', () => {
    const bloqueados = AULA_1_2_PAIRS.filter( p =>
      hasBlockingViolation( validateEvidencePair( p ) ),
    );
    expect( bloqueados ).toHaveLength( 0 );
  } );

  it( 'mas todos carregam ressalva: nenhum par está livre de avisos', () => {
    /*
     * Evidência válida NÃO é evidência completa. Os três pares carregam ao
     * menos um aviso — combos do HRC ilegíveis em todos, e correspondência de
     * sizing não verificável no par 3. O ledger exige pares independentes E
     * REPRODUZÍVEIS antes de qualquer calibração; reprodutibilidade não foi
     * obtida, e versão de solver e e-Nash não constam de nenhuma captura.
     *
     * Este teste falha no dia em que alguém "limpar" os avisos sem obter o
     * dado que falta.
     */
    for ( const par of AULA_1_2_PAIRS ) {
      const avisos = validateEvidencePair( par ).filter( v => v.severity === 'warning' );
      expect( avisos.length ).toBeGreaterThan( 0 );
    }
  } );
} );
