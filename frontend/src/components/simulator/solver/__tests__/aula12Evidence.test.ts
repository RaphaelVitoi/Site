/**
 * Integração: o contrato de evidência contra os dados REAIS da Aula 1.2.
 *
 * Estes testes existem porque "módulo que ninguém importa não é integração"
 * (CLAUDE.md §4). O contrato foi escrito contra fixtures sintéticas; aqui ele
 * encontra as seis transcrições reais, em dupla leitura cega, e precisa
 * discriminar entre um par legitimamente comparável e um par que não é.
 */

import {
  validateEvidencePair,
  hasBlockingViolation,
  classifyAction,
  classifyActionNoCenario,
  DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT,
  DEFAULT_SIZING_EQUIVALENCE_TOLERANCE_BB,
  DEFAULT_SIZING_EQUIVALENCE_RELATIVE,
  isRead,
  isUnreadable,
  type EvidenceViolationCode,
} from '../evidenceContract';
import {
  AULA_1_2_PAIRS,
  PAR_1_BB_LEADING,
  PAR_2_IP_APOS_CHECK,
  PAR_3_IP_VS_CBET_TURN,
  PAR_4_OOP_RIVER,
  PAR_5_IP_VS_XR_FLOP,
  PAR_6_BB_TURN_APOS_CALL,
  PAR_7_BB_VS_CBET_SMALL,
  QUASE_ENCONTRO_DE_SIZING_PAR_7,
  TRILHA_GTO_WIZARD,
  GLIFO_DE_DIRECAO,
  CADEIA_TURN_RIVER,
  CADEIA_FLOP_TURN_RIVER,
  ATRIBUICAO_AMBIGUA_NODELOCK,
  NODELOCK_IP_CBET_SMALL,
  HIPOTESE_BASE_DO_ALLIN,
  PAINEL_CHIPEV_RIVER,
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
  it( 'todos os pares carregam o mesmo SHA-256 da fonte', () => {
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
  // 9.38 + 0.05 + 18.39 = 27.82 vs 27.8 declarado
  // 113.13 + 252.95 + 4.82 + 0.01 = 370.91 vs 370.9 declarado
  // 28.38 + 9.33 + 11.76 = 49.47 vs 49.5 declarado
  // 268.83 + 432.38 + 51.52 + 0 = 752.73 vs 752.7 declarado
  it.each( [
    [ 'par 1', PAR_1_BB_LEADING ],
    [ 'par 2', PAR_2_IP_APOS_CHECK ],
    [ 'par 3', PAR_3_IP_VS_CBET_TURN ],
    [ 'par 4', PAR_4_OOP_RIVER ],
    [ 'par 5', PAR_5_IP_VS_XR_FLOP ],
    [ 'par 6', PAR_6_BB_TURN_APOS_CALL ],
    [ 'par 7', PAR_7_BB_VS_CBET_SMALL ],
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
     * divergem.
     *
     * A CAUSA NÃO ESTÁ DETERMINADA. Uma versão anterior deste comentário
     * afirmava que "o GTO Wizard modela stack efetiva 40/40 e o HRC modela as
     * stacks reais 39.88/53.88 — potes diferentes no mesmo ramo". Isso foi
     * DESCARTADO pelo autor da fonte: a stack efetiva é 40bb nos dois cenários
     * antes do open. A explicação caiu junto com a premissa; a fixture já fora
     * corrigida e este comentário era o resíduo.
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

describe( 'Aula 1.2 — Etapa B: o river, e o que ele verifica da Etapa A', () => {
  it( 'a cadeia turn → river fecha: pote, call e stacks', () => {
    /*
     * Duas capturas transcritas sem que uma informasse a outra. Encaixadas,
     * fecham uma aritmética que nenhuma contém sozinha. Se um dígito do par 3
     * ou do par 4 estivesse errado, estas igualdades quebrariam.
     */
    const c = CADEIA_TURN_RIVER;
    expect( c.potTurnBb + c.callDoIpBb ).toBeCloseTo( c.potRiverBb, 5 );
    expect( c.stackIpNoTurnBb - c.callDoIpBb ).toBeCloseTo( c.stackNoRiverBb, 5 );

    // E os valores da cadeia são os MESMOS que as fixtures declaram.
    const turn = PAR_3_IP_VS_CBET_TURN.context.potBb;
    const river = PAR_4_OOP_RIVER.context.potBb;
    expect( isRead( turn ) && turn.value ).toBe( c.potTurnBb );
    expect( isRead( river ) && river.value ).toBe( c.potRiverBb );
  } );

  it( 'os combos do call no turn reaparecem como range do IP no river', () => {
    // 188.36 (par 3, ação `Call`) contra 188.3 (par 4, painel do BTN).
    // Nós distintos da mesma árvore; o número atravessa.
    const call = PAR_3_IP_VS_CBET_TURN.chipEv.actions.find(
      a => classifyAction( a.label ) === 'call',
    );
    expect( call ).toBeDefined();
    const combos = call!.combos;
    expect( combos ).toBeDefined();
    expect( isRead( combos! ) ).toBe( true );
    if ( isRead( combos! ) ) {
      expect( combos.value ).toBe( CADEIA_TURN_RIVER.combosDoCallNoTurn );
      expect( Math.abs( combos.value - PAINEL_CHIPEV_RIVER.btnIp.combos ) )
        .toBeLessThanOrEqual( 0.1 );
    }
  } );

  it( 'o glifo antes do EV é indicador de direção — prova interna, não leitura', () => {
    /*
     * Nenhum dos dois leitores decidiu o sinal; o Leitor 2 declarou não
     * distingui-lo. Não é preciso: duas equidades complementares somam 100 e
     * não podem ser ambas negativas, e os combos do BB reaparecem como a soma
     * das ações. Prova interna, por mecanismo diferente do usado na Etapa A.
     */
    expect(
      PAINEL_CHIPEV_RIVER.bbOop.equidadePct + PAINEL_CHIPEV_RIVER.btnIp.equidadePct,
    ).toBeCloseTo( PAINEL_CHIPEV_RIVER.somaDasEquidadesPct, 5 );

    const soma = PAR_4_OOP_RIVER.chipEv.actions.reduce( ( acc, a ) => {
      const c = a.combos;
      return acc + ( c !== undefined && isRead( c ) ? c.value : 0 );
    }, 0 );
    expect( soma ).toBeCloseTo( PAINEL_CHIPEV_RIVER.bbOop.combos, 1 );
  } );

  it( 'um all-in sem aposta pendente é BET, não raise — regra de pôquer', () => {
    /*
     * Não se aumenta onde se pode pedir mesa. O GTO Wizard escreve
     * `Allin 27.2 (87%)` e o HRC escreve `bets 24.94bb` para o mesmo tipo de
     * ramo; classificar por grafia recriaria, um nível acima, exatamente o
     * defeito que `classifyAction` existe para eliminar.
     */
    const rotulo = 'Allin 27.2 (87%)';
    expect( classifyAction( rotulo ) ).toBe( 'raise' );
    expect( classifyActionNoCenario( rotulo, PAR_4_OOP_RIVER.chipEv ) ).toBe( 'bet' );

    // E onde HÁ aposta pendente (par 3: o cenário oferece fold e call, não
    // check), o all-in continua sendo raise. A correção não é global.
    const allinDoTurn = PAR_3_IP_VS_CBET_TURN.chipEv.actions.find(
      a => /allin/i.test( a.label ),
    );
    expect( allinDoTurn ).toBeDefined();
    expect( classifyActionNoCenario( allinDoTurn!.label, PAR_3_IP_VS_CBET_TURN.chipEv ) )
      .toBe( 'raise' );
  } );

  it( 'par 4 é incomparável por CARDINALIDADE de sizings, e isso é aviso', () => {
    /*
     * ICMev oferece três sizings de aposta onde o ChipEV oferece dois. É
     * diferença real de árvore, não de nomenclatura — e restrição do solver,
     * portanto nunca bloqueante.
     */
    const violacoes = validateEvidencePair( PAR_4_OOP_RIVER );
    const incomparavel = violacoes.find( v => v.code === 'ACTION_SET_INCOMPARABLE' );
    expect( incomparavel ).toBeDefined();
    expect( incomparavel!.severity ).toBe( 'warning' );
    expect( hasBlockingViolation( violacoes ) ).toBe( false );

    // O motivo reportado NÃO pode ser um artefato do classificador: depois da
    // normalização, nenhum dos lados tem `raise`.
    const det = incomparavel!.details as {
      chipEvPorClasse: Record<string, number>;
      icmEvPorClasse: Record<string, number>;
    };
    expect( det.chipEvPorClasse.raise ).toBe( 0 );
    expect( det.icmEvPorClasse.raise ).toBe( 0 );
    expect( det.chipEvPorClasse.bet ).toBe( 2 );
    expect( det.icmEvPorClasse.bet ).toBe( 3 );
  } );

  it( 'a soma 100.1% aparece pela terceira vez, agora no HRC pós-flop', () => {
    // Par 2 (GTO Wizard), defesa pré-flop do BB (HRC) e agora o river do HRC.
    // Três painéis, dois solvers: é padrão de exibição da fonte.
    const soma = PAR_4_OOP_RIVER.icmEv.actions.reduce( ( acc, a ) => {
      const f = a.frequencyPct;
      return acc + ( f !== undefined && isRead( f ) ? f.value : 0 );
    }, 0 );
    expect( soma ).toBeCloseTo( 100.1, 5 );
    expect( codes( validateEvidencePair( PAR_4_OOP_RIVER ) ) )
      .not.toContain( 'FREQUENCY_SUM_MISMATCH' );
  } );
} );

describe( 'Aula 1.2 — Etapa C: a linha inteira, e a ambiguidade que ela nao apaga', () => {
  it( 'a cadeia flop -> turn -> river fecha em seis identidades', () => {
    /*
     * Quatro capturas, transcritas sem que uma informasse a outra. Um erro de
     * digito em qualquer par quebraria pelo menos uma destas igualdades.
     */
    const c = CADEIA_FLOP_TURN_RIVER;
    expect( c.flop.potBb + c.flop.callDoIpBb ).toBeCloseTo( c.turn.potBb, 5 );
    expect( c.flop.stackBtnBb - c.flop.callDoIpBb ).toBeCloseTo( c.turn.stacksBb, 5 );
    expect( c.turn.potBb * 0.5 ).toBeCloseTo( c.turn.cbetDe50PctBb, 1 );
    expect( c.turn.potBb + c.turn.cbetDe50PctBb )
      .toBeCloseTo( c.turnDianteDaAposta.potBb, 5 );
    expect( c.turn.stacksBb - c.turn.cbetDe50PctBb )
      .toBeCloseTo( c.turnDianteDaAposta.stackBbBb, 5 );
    expect( c.turnDianteDaAposta.potBb + c.turnDianteDaAposta.callDoIpBb )
      .toBeCloseTo( c.river.potBb, 5 );
  } );

  it( 'a cadeia bate com o que cada fixture declara — nao e numero paralelo', () => {
    const c = CADEIA_FLOP_TURN_RIVER;
    const potes: [ typeof PAR_5_IP_VS_XR_FLOP, number ][] = [
      [ PAR_5_IP_VS_XR_FLOP, c.flop.potBb ],
      [ PAR_6_BB_TURN_APOS_CALL, c.turn.potBb ],
      [ PAR_3_IP_VS_CBET_TURN, c.turnDianteDaAposta.potBb ],
      [ PAR_4_OOP_RIVER, c.river.potBb ],
    ];
    for ( const [ par, esperado ] of potes ) {
      const p = par.context.potBb;
      expect( isRead( p ) && p.value ).toBe( esperado );
    }
  } );

  it( 'o range do IP de 370.9 atravessa tres capturas — e explicado pelo nodelock', () => {
    /*
     * 370.9 combos e o range INTEIRO do IP. So faz sentido no par 5 porque o
     * lock obriga o IP a apostar 1.1 com 100% da mao; sem esse contexto, o
     * numero pareceria defeito.
     */
    expect( NODELOCK_IP_CBET_SMALL.acoes.bet.frequencyPct ).toBe( 100 );
    expect( NODELOCK_IP_CBET_SMALL.acoes.bet.combos )
      .toBe( CADEIA_FLOP_TURN_RIVER.rangeDoIp );

    const chip2 = PAR_2_IP_APOS_CHECK.chipEv.totalCombos;
    const chip5 = PAR_5_IP_VS_XR_FLOP.chipEv.totalCombos;
    expect( isRead( chip2! ) && chip2.value ).toBe( CADEIA_FLOP_TURN_RIVER.rangeDoIp );
    expect( isRead( chip5! ) && chip5.value ).toBe( CADEIA_FLOP_TURN_RIVER.rangeDoIp );
  } );

  it( 'o shove 32.81bb do HRC no turn aparece em duas capturas independentes', () => {
    const sizings = ( par: typeof PAR_3_IP_VS_CBET_TURN ) =>
      par.icmEv.actions
        .map( a => a.sizingBb )
        .filter( s => s !== undefined && isRead( s ) )
        .map( s => ( s as { value: number } ).value );
    expect( sizings( PAR_3_IP_VS_CBET_TURN ) )
      .toContain( CADEIA_FLOP_TURN_RIVER.shoveDoHrcNoTurnBb );
    expect( sizings( PAR_6_BB_TURN_APOS_CALL ) )
      .toContain( CADEIA_FLOP_TURN_RIVER.shoveDoHrcNoTurnBb );
  } );

  it( 'par 5 tem classes correspondentes e sizings divergentes — como o par 3', () => {
    // Diante de aposta pendente nao ha `check`, entao `Allin 40` continua sendo
    // raise. Os dois lados oferecem fold, call e dois raises.
    const violacoes = validateEvidencePair( PAR_5_IP_VS_XR_FLOP );
    const encontrados = codes( violacoes );
    expect( encontrados ).not.toContain( 'ACTION_SET_INCOMPARABLE' );
    expect( encontrados ).toContain( 'SIZING_CORRESPONDENCE_UNVERIFIABLE' );
    expect( hasBlockingViolation( violacoes ) ).toBe( false );
    expect( classifyActionNoCenario( 'Allin 40 (224%)', PAR_5_IP_VS_XR_FLOP.chipEv ) )
      .toBe( 'raise' );
  } );

  it( 'par 6 repete a forma do par 4: cardinalidade de bets, e aviso', () => {
    const violacoes = validateEvidencePair( PAR_6_BB_TURN_APOS_CALL );
    const sinal = violacoes.find( v => v.code === 'ACTION_SET_INCOMPARABLE' );
    expect( sinal ).toBeDefined();
    expect( sinal!.severity ).toBe( 'warning' );
    const det = sinal!.details as { chipEvPorClasse: Record<string, number>; icmEvPorClasse: Record<string, number> };
    expect( det.chipEvPorClasse.raise ).toBe( 0 );
    expect( det.chipEvPorClasse.bet ).toBe( 2 );
    expect( det.icmEvPorClasse.bet ).toBe( 3 );
    expect( hasBlockingViolation( violacoes ) ).toBe( false );
  } );

  it( 'a soma 100.1% chega a quarta ocorrencia, a segunda no GTO Wizard', () => {
    const soma = PAR_6_BB_TURN_APOS_CALL.chipEv.actions.reduce( ( acc, a ) => {
      const f = a.frequencyPct;
      return acc + ( f !== undefined && isRead( f ) ? f.value : 0 );
    }, 0 );
    expect( soma ).toBeCloseTo( 100.1, 5 );
    expect( codes( validateEvidencePair( PAR_6_BB_TURN_APOS_CALL ) ) )
      .not.toContain( 'FREQUENCY_SUM_MISMATCH' );
  } );

  it( 'a ambiguidade de atribuicao esta DECLARADA nos dois pares que ela afeta', () => {
    /*
     * O documento reusa image55 e image45 entre passes de nodelock diferentes.
     * Esconder isso tornaria os pares mais limpos e menos verdadeiros. Este
     * teste falha se alguem apagar a ressalva do nodeLabel.
     */
    expect( ATRIBUICAO_AMBIGUA_NODELOCK.pendenteDeArbitragem ).toBe( true );
    for ( const par of [ PAR_5_IP_VS_XR_FLOP, PAR_6_BB_TURN_APOS_CALL ] ) {
      expect( par.source.nodeLabel ).toMatch( /ATRIBUIÇÃO AMBÍGUA/ );
    }
    // E a prova de que a atribuicao do documento e falivel continua registrada.
    expect( NODELOCK_IP_CBET_SMALL.legendas ).toHaveLength( 3 );
    expect( NODELOCK_IP_CBET_SMALL.legendas[ 2 ] ).toMatch( /INCOMPATÍVEL/ );
  } );

  it( 'a hipotese da base do all-in NAO vira explicacao', () => {
    /*
     * `Allin 40` contra `raises 37.88bb` e observacao numerica, nao causa. O
     * Tier 0 descartou a explicacao de stacks efetivas distintas por regime, e
     * a causa da divergencia de sizing segue NAO DETERMINADA. Este teste falha
     * se alguem promover a hipotese a fato sem a recaptura que a falsificaria.
     */
    expect( HIPOTESE_BASE_DO_ALLIN.confirmada ).toBe( false );
    expect( HIPOTESE_BASE_DO_ALLIN.causaDaDivergenciaDeSizing ).toBe( 'NAO DETERMINADA' );
    expect( HIPOTESE_BASE_DO_ALLIN.icmEvAllinBb ).toBe( MESA_COMPLETA_NO_OPEN.efetivaPosFlopBb );
    expect( HIPOTESE_BASE_DO_ALLIN.falsificador.length ).toBeGreaterThan( 0 );
  } );
} );

describe( 'Aula 1.2 — a trilha do solver, que verifica quatro capturas de uma vez', () => {
  it( 'a trilha confirma os conjuntos de acao de tres pares e do nodelock', () => {
    /*
     * `image59.png` inclui a barra de navegacao do GTO Wizard: a arvore inteira.
     * Cada coluna lista o jogador, a stack e TODAS as acoes daquele ponto. Os
     * rotulos batem com o que cada captura mostra isoladamente.
     */
    const porConfirmacao = ( alvo: string ) =>
      TRILHA_GTO_WIZARD.colunas.find( c => 'confirma' in c && c.confirma === alvo );

    const rotulos = ( par: typeof PAR_7_BB_VS_CBET_SMALL ) =>
      par.chipEv.actions.map( a => a.label ).sort();

    const col7 = porConfirmacao( 'PAR_7_BB_VS_CBET_SMALL' );
    expect( col7 ).toBeDefined();
    expect( [ ...col7!.acoes! ].sort() ).toEqual( rotulos( PAR_7_BB_VS_CBET_SMALL ) );

    const col5 = porConfirmacao( 'PAR_5_IP_VS_XR_FLOP' );
    expect( col5 ).toBeDefined();
    expect( [ ...col5!.acoes! ].sort() ).toEqual( rotulos( PAR_5_IP_VS_XR_FLOP ) );

    // As stacks da trilha tambem batem com o contexto de cada par.
    const stackIp5 = PAR_5_IP_VS_XR_FLOP.context.players.find( p => p.position === 'IP' )!.stackBb;
    expect( isRead( stackIp5 ) && stackIp5.value ).toBe( col5!.stackBb );
  } );

  it( 'o ramo Bet 7.8 (50%) esta NA TELA — a ligacao par 6 -> par 3 deixou de ser inferida', () => {
    /*
     * A cadeia da Etapa C calculava 15.63 x 50% para chegar aos 7.80. Aqui o
     * ramo aparece rotulado, com frequencia e combos medidos.
     */
    const bet = TRILHA_GTO_WIZARD.noAtual.acoes.find( a => a.label.startsWith( 'Bet 7.8' ) );
    expect( bet ).toBeDefined();
    expect( bet!.frequencyPct ).toBe( 57.6 );
    expect( TRILHA_GTO_WIZARD.noAtual.potBb ).toBe( CADEIA_FLOP_TURN_RIVER.turn.potBb );
    expect( CADEIA_FLOP_TURN_RIVER.turn.cbetDe50PctBb ).toBe( 7.8 );
  } );

  it( 'mesmo no que o par 6, menu de sizings diferente — o nodelock em acao', () => {
    /*
     * Mesmo pote, mesmas stacks, mesmas equidades e mesmos combos que o par 6,
     * com menu de apostas diferente. E a demonstracao concreta do que a
     * ambiguidade de atribuicao adverte.
     */
    expect( TRILHA_GTO_WIZARD.mesmoNoQueOPar6ComMenuDiferente ).toBe( true );
    const p6 = PAR_6_BB_TURN_APOS_CALL.context.potBb;
    expect( isRead( p6 ) && p6.value ).toBe( TRILHA_GTO_WIZARD.noAtual.potBb );
    const combos6 = PAR_6_BB_TURN_APOS_CALL.chipEv.totalCombos;
    expect( isRead( combos6! ) && combos6.value )
      .toBe( TRILHA_GTO_WIZARD.noAtual.painel.bbOop.combos );

    // ... e os menus divergem de fato.
    const menuTrilha = TRILHA_GTO_WIZARD.colunas[ 6 ]!.acoes!;
    const menuPar6 = PAR_6_BB_TURN_APOS_CALL.chipEv.actions.map( a => a.label );
    expect( menuTrilha.length ).not.toBe( menuPar6.length );
  } );

  it( 'o glifo esta encerrado por OBSERVACAO DIRETA, nao so por aritmetica', () => {
    /*
     * Ate a Etapa C a prova era indireta: equidade nao e negativa, equidades
     * complementares somam 100. Aqui o leitor cego respondeu campo a campo que
     * os oito simbolos NAO sao iguais entre si -- quatro para cima, quatro para
     * baixo. Um sinal de menos nao aponta para cima.
     */
    expect( GLIFO_DE_DIRECAO.simbolosUniformes ).toBe( false );
    expect( GLIFO_DE_DIRECAO.antiCorrelacionadoEntreJogadores ).toBe( true );

    const bb = GLIFO_DE_DIRECAO.direcoes.bbOop;
    const ip = GLIFO_DE_DIRECAO.direcoes.btnIp;
    const oposto = ( a: string, b: string ) => ( a === 'cima' ) !== ( b === 'cima' );
    expect( oposto( bb.ev, ip.ev ) ).toBe( true );
    expect( oposto( bb.equidade, ip.equidade ) ).toBe( true );
    expect( oposto( bb.eqr, ip.eqr ) ).toBe( true );
    expect( oposto( bb.combos, ip.combos ) ).toBe( true );

    // A prova aritmetica anterior continua valendo, por caminho independente.
    expect(
      TRILHA_GTO_WIZARD.noAtual.painel.bbOop.equidadePct +
      TRILHA_GTO_WIZARD.noAtual.painel.btnIp.equidadePct,
    ).toBeCloseTo( 100, 5 );
  } );

  it( 'par 7: o quase-encontro de sizing NAO afrouxou a tolerancia', () => {
    /*
     * `Raise 5` contra `raises 5.06bb` reprova por 0.0094. Alargar a folga para
     * acomodar seria ajustar o instrumento ao resultado.
     */
    const q = QUASE_ENCONTRO_DE_SIZING_PAR_7;
    expect( q.diferenca ).toBeGreaterThan( q.folgaVigente );
    expect( q.folgaVigente ).toBeCloseTo(
      Math.max( DEFAULT_SIZING_EQUIVALENCE_TOLERANCE_BB, q.icmEvBb * DEFAULT_SIZING_EQUIVALENCE_RELATIVE ),
      6,
    );
    expect( codes( validateEvidencePair( PAR_7_BB_VS_CBET_SMALL ) ) )
      .toContain( 'SIZING_CORRESPONDENCE_UNVERIFIABLE' );
  } );

  it( 'par 7: a soma 99.9% e a primeira ABAIXO de 100 — o desvio e simetrico', () => {
    const soma = PAR_7_BB_VS_CBET_SMALL.chipEv.actions.reduce( ( acc, a ) => {
      const f = a.frequencyPct;
      return acc + ( f !== undefined && isRead( f ) ? f.value : 0 );
    }, 0 );
    expect( soma ).toBeCloseTo( 99.9, 5 );
    expect( codes( validateEvidencePair( PAR_7_BB_VS_CBET_SMALL ) ) )
      .not.toContain( 'FREQUENCY_SUM_MISMATCH' );
  } );

  it( 'par 7 esta no conjunto, e a retificacao da rejeicao esta registrada', () => {
    /*
     * A Etapa A rejeitou o no 13 por CONTAR insercoes em vez de LER a captura.
     * Este teste falha se alguem remover o par sem antes desfazer a retificacao.
     */
    expect( AULA_1_2_PAIRS ).toContain( PAR_7_BB_VS_CBET_SMALL );
    expect( ATRIBUICAO_AMBIGUA_NODELOCK.afetaPares )
      .toContain( 'PAR_7_BB_VS_CBET_SMALL' );
    expect( Object.keys( ATRIBUICAO_AMBIGUA_NODELOCK.capturas ) )
      .toContain( 'image7.png' );
  } );
} );

describe( 'Aula 1.2 — o que a evidência NÃO autoriza', () => {
  it( 'todos os pares são evidência válida: nenhum é descartado por divergir', () => {
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
