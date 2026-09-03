/**
 * IDENTITY: Contrato de Evidência Primária — pares ChipEV × ICMev
 * PATH: src/components/simulator/solver/evidenceContract.ts
 * ROLE: Tipar e validar a unidade de evidência extraída de documento de estudo,
 *       onde o MESMO nó de decisão é resolvido em dois regimes:
 *       ChipEV (ex.: GTO Wizard) e ICMev (ex.: HRC).
 *
 * PRINCÍPIO CENTRAL — "não lido" ≠ "lido como zero":
 *   Todo campo numérico é um `Measured<number>`, união discriminada entre
 *   `{ kind: 'read', value }` e `{ kind: 'unreadable' }`. Nunca use 0, null
 *   solto ou NaN para sinalizar ausência: um sizing de 0bb e um sizing
 *   ilegível são fatos diferentes e o contrato os mantém diferentes.
 *
 * PRINCÍPIO DE NÃO-INTERVENÇÃO:
 *   O validador NUNCA normaliza, redistribui ou "conserta" frequência.
 *   Soma que não fecha vira violação reportada. Redistribuição silenciosa é
 *   exatamente o defeito que este contrato existe para impedir.
 *
 * @format
 */

import type { Street } from './types';

// ---------------------------------------------------------------------------
// 1. Valor medido — "ilegível/ausente" como cidadão de primeira classe
// ---------------------------------------------------------------------------

/** Valor efetivamente lido da captura. */
export interface ReadValue<T> {
  kind: 'read';
  value: T;
}

/**
 * Valor que existe no documento mas não pôde ser lido (borrado, cortado,
 * ocluído), ou que a captura simplesmente não expõe.
 * NÃO é zero, NÃO é ausência semântica de ação.
 */
export interface UnreadableValue {
  kind: 'unreadable';
  /** Motivo textual opcional — ex.: 'coluna cortada na figura'. */
  reason?: string;
}

export type Measured<T> = ReadValue<T> | UnreadableValue;
export type MeasuredNumber = Measured<number>;

/** Construtor de valor lido. */
export function read<T>( value: T ): ReadValue<T> {
  return { kind: 'read', value };
}

/** Construtor de valor ilegível/ausente. */
export function unreadable( reason?: string ): UnreadableValue {
  return reason === undefined ? { kind: 'unreadable' } : { kind: 'unreadable', reason };
}

export function isRead<T>( m: Measured<T> ): m is ReadValue<T> {
  return m.kind === 'read';
}

export function isUnreadable<T>( m: Measured<T> ): m is UnreadableValue {
  return m.kind === 'unreadable';
}

// ---------------------------------------------------------------------------
// 2. Identidade da fonte
// ---------------------------------------------------------------------------

/** Procedência verificável da evidência dentro do documento de estudo. */
export interface EvidenceSource {
  /** SHA-256 do documento de origem, em hexadecimal minúsculo (64 chars). */
  documentSha256: string;
  /** Índice da figura/captura dentro do documento (0-based). */
  figureIndex: number;
  /** Rótulo do nó de decisão exatamente como aparece na captura. */
  nodeLabel: string;
}

// ---------------------------------------------------------------------------
// 3. Contexto do spot
// ---------------------------------------------------------------------------

/** Street do nó. Preflop incluído — nem todo nó comparado é pós-flop. */
export type EvidenceStreet = 'preflop' | Street;

export type EvidencePosition = 'OOP' | 'IP';

export interface EvidencePlayer {
  /** Identificador do jogador na captura (ex.: rótulo de assento). */
  id: string;
  position: EvidencePosition;
  /** Stack efetivo em big blinds. */
  stackBb: MeasuredNumber;
}

export interface EvidenceContext {
  street: EvidenceStreet;
  /** Board como texto da captura; ilegível quando a figura não permite ler. */
  board: Measured<string>;
  /** Pote em big blinds no momento do nó. */
  potBb: MeasuredNumber;
  /** Stacks por jogador; deve conter exatamente um OOP e um IP em heads-up. */
  players: EvidencePlayer[];
}

// ---------------------------------------------------------------------------
// 4. Ações e cenários
// ---------------------------------------------------------------------------

export interface EvidenceAction {
  /** Rótulo exibido na captura (ex.: 'Bet 33%', 'Check', 'Fold'). */
  label: string;
  /** Sizing em big blinds quando a ação tiver sizing; ausente para Check/Fold. */
  sizingBb?: MeasuredNumber;
  /** Frequência em pontos percentuais, domínio [0, 100]. */
  frequencyPct: MeasuredNumber;
  /** Combos atribuídos à ação, quando a captura expuser combos. */
  combos?: MeasuredNumber;
}

/** Regime de cálculo do solver que produziu o cenário. */
export type EvidenceRegime = 'chipEV' | 'icmEV';

/**
 * Unidade do e-Nash. NÃO tem padrão, e isso é deliberado.
 *
 * Solvers reportam a distância ao equilíbrio em grandezas diferentes — fração
 * do pote, big blinds por 100 mãos, fichas absolutas. Um `eNash: 0.4` sem
 * unidade é indistinguível entre "0,4% do pote" (solve apertado) e "0,4 bb"
 * (solve grosseiro). Assumir uma unidade padrão converteria a ambiguidade em
 * número confiável, que é o defeito que este contrato inteiro existe para
 * impedir.
 *
 * `pct` E `pctOfPot` SÃO COISAS DIFERENTES, E A DISTINÇÃO É O PONTO. Ler um
 * símbolo `%` na tela autoriza dizer que a grandeza é percentual — `pct` — e
 * nada além. "Por cento de quê" é decidido pelo algoritmo do solver, não pela
 * teoria, e no HRC esse algoritmo não é público. `pctOfPot` só se usa quando o
 * próprio export declara o referente.
 */
export type ENashUnit = 'pct' | 'pctOfPot' | 'bb' | 'bbPer100' | 'chips';

/**
 * Procedência computacional do solve — o que separa transcrição de MEDIÇÃO.
 *
 * POR QUE ISTO É UM TIPO, E NÃO PROSA NUM COMENTÁRIO:
 *   `AULA_1_2_EVIDENCE_LEDGER.md` exige "versão do solver, parâmetros da árvore
 *   e e-Nash quando disponível" antes de qualquer par ser considerado
 *   reproduzível. Até esta extensão, `EvidenceScenario` declarava apenas
 *   `solver: string` — o NOME. Não havia onde pousar build nem e-Nash, e a
 *   consequência prática é que uma recaptura que os trouxesse não teria destino
 *   tipado: viraria comentário, e comentário não é verificável.
 *
 * O CAMPO É `Measured<T>` PELO MESMO MOTIVO DE TODOS OS OUTROS: um solve cujo
 * e-Nash não foi lido é diferente de um solve com e-Nash zero. O segundo é
 * convergência perfeita; o primeiro é ignorância. Colapsá-los seria afirmar
 * convergência que ninguém observou.
 */
export interface SolverProvenance {
  /**
   * Versão/build exatamente como o solver a declara (ex.: 'v2.4.1').
   *
   * NÃO É METADADO DECORATIVO. A teoria — distância ao equilíbrio, ICM, CFR —
   * é o caminho, e é pública. O que é proprietário são os ATALHOS: como chegar
   * ao mesmo destino mais rápido, e com que critério parar. No HRC em especial.
   *
   * O atalho é o que decide ONDE o solve para, então é ele quem produz o número
   * do e-Nash. Daí a consequência mecânica: uma versão nova, com atalho novo,
   * para em outro ponto com os MESMOS inputs. Dois `0.3` de builds diferentes
   * podem não ser o mesmo fato, e é por isso que `build` é âncora e não enfeite.
   */
  build: Measured<string>;
  /**
   * Motor que EFETIVAMENTE computou o número, quando difere do produto onde ele
   * foi lido. Produto não é motor.
   *
   * O GTO Wizard usa redes neurais nas features avançadas, mas suas features
   * médias e básicas foram computadas **via HRC, em CIs subótimos** (Tier 0,
   * 2026-09-03). Um número lido na interface do GTO Wizard pode portanto ter
   * saído do HRC — e nesse caso a versão que importa é a do HRC, não a do
   * produto, e o solve pode não estar convergido.
   *
   * MOTOR COMUM NOS DOIS LADOS FORTALECE O PAR, NÃO O ENFRAQUECE. O HRC calcula
   * ChipEV além de ICMev, então um par ChipEV(HRC) × ICMev(HRC) roda o MESMO
   * modelo nos dois lados, e a única variável que resta variando é o REGIME —
   * que é precisamente o que o par existe para isolar. É controle experimental.
   *
   * O risco está no contrário: motores diferentes misturam o efeito do regime
   * com o efeito do motor, e nenhuma análise separa os dois depois. Declarar só
   * o produto esconde qual dos dois casos se tem.
   *
   * O GTO WIZARD TEM DOIS CAMINHOS, E SÓ UM DELES É DELE:
   *
   * - **Biblioteca / tabelas estáticas** — os spots pré-computados **foram
   *   rodados no HRC e apresentados como biblioteca** (Tier 0, 2026-09-03). É
   *   por isso que aquele painel também reporta `CI`: é o rótulo do HRC.
   * - **GTO Wizard AI** — depth-limited subgame solving com counterfactual
   *   value networks (linhagem DeepStack/ReBeL): CFR só na street ativa, e os
   *   terminais truncados avaliados por rede treinada em self-play.
   *
   * A diferença NÃO é de rótulo, é de ESCOPO DO CÁLCULO. Exploitability de
   * árvore completa e exploitability de subjogo truncado com terminais
   * estimados por rede não são a mesma grandeza — a segunda é residual em
   * relação a um jogo que nunca foi inteiramente percorrido. Comparar as duas
   * como se fossem o mesmo número é o erro que este campo existe para evitar.
   *
   * CONSEQUÊNCIA PARA OS SETE PARES DA AULA 1.2: se o lado ChipEV veio da
   * biblioteca, ele saiu do HRC — o mesmo motor do lado ICMev. Motor comum é
   * controle, não coincidência suspeita, e portanto aqueles pares já isolam o
   * regime melhor do que sua procedência declarada deixava ver. O que resta
   * confirmar caso a caso é se a captura é de biblioteca ou do AI, e o
   * discriminante está na tela: `CI` no painel indica biblioteca.
   *
   * Ainda assim: quem transcreve decide e declara. Este contrato nunca infere
   * `engine` sozinho, pela mesma razão que nunca redistribui frequência.
   */
  engine?: Measured<string>;
  /** Distância ao equilíbrio residual do solve. Sem unidade não se interpreta. */
  eNash: MeasuredNumber;
  /** Unidade do e-Nash. Ausente quando o próprio e-Nash é ilegível. */
  eNashUnit?: Measured<ENashUnit>;
  /**
   * Rótulo NATIVO da métrica, exatamente como o solver a nomeia:
   *
   * - `CI` (HRC) — Convergence Indicator, dos cálculos de Monte Carlo do HRC.
   *   A documentação pública o lista entre os essenciais do cálculo por
   *   amostragem; a fórmula exata não foi obtida.
   * - `Nash Distance` / `dEV` (GTO Wizard) — máxima perda de EV potencial da
   *   solução, em big blinds **dividida pelo pote**. O AI resolve a ~0,1% pot.
   * - `MES` (PioSOLVER) — Maximally Exploitative Strategy.
   *
   * Indicador de convergência de amostragem e EV-loss máximo relativo ao pote
   * NÃO são a mesma grandeza. A proibição de comparar entre solvers tem base
   * documental, não é cautela genérica.
   *
   * e-Nash é o CONCEITO; o nome é de cada um. Guardar só o número perderia qual
   * métrica foi lida, e é o mesmo motivo pelo qual `classifyAction` existe: o
   * rótulo varia, o ramo não. Aqui a variação é mais séria — rótulos distintos
   * saem de algoritmos distintos, então os valores NÃO se comparam entre
   * solvers. O campo qualifica quão convergido está aquele solve isoladamente.
   *
   * A incomparabilidade é máxima quando um dos lados é rede neural: aproximação
   * de rede e CFR convergido não produzem grandezas da mesma natureza.
   *
   * Não entra em `assessReproducibility`: o rótulo é derivável do solver, que
   * `build` já ancora. Existe para auditoria.
   */
  eNashLabel?: Measured<string>;
}

export interface EvidenceScenario {
  regime: EvidenceRegime;
  /** Solver que produziu o cenário (ex.: 'GTO Wizard', 'HRC'). */
  solver: string;
  /**
   * Procedência do solve. OPCIONAL no tipo porque os sete pares da Aula 1.2 são
   * anteriores a este campo e não podem ganhá-lo retroativamente — a captura de
   * origem não o expunha. Omitir é honesto; inventar não seria.
   */
  provenance?: SolverProvenance;
  actions: EvidenceAction[];
  /** Total de combos do range do jogador no nó, quando exposto pela captura. */
  totalCombos?: MeasuredNumber;
  /**
   * Stacks COMO ESTE SOLVER OS MODELA, quando diferem do contexto declarado.
   *
   * Existe porque os dois motores não partem do mesmo estado: o GTO Wizard
   * reduz o spot à stack EFETIVA entre os dois jogadores ativos, enquanto o
   * HRC carrega as stacks reais de todos os assentos. No mesmo nó, um vê
   * 40/40 e o outro vê 37.88/52.88 — e é dessa diferença que nascem potes e
   * sizings distintos street abaixo.
   *
   * Tratar isso como um contexto único faria os dois cenários parecerem
   * medições do mesmo estado, quando não são.
   */
  players?: EvidencePlayer[];
}

/** Unidade de evidência: o MESMO nó resolvido nos dois regimes. */
export interface EvidencePair {
  source: EvidenceSource;
  context: EvidenceContext;
  chipEv: EvidenceScenario;
  icmEv: EvidenceScenario;
}

// ---------------------------------------------------------------------------
// 5. Violações
// ---------------------------------------------------------------------------

export type EvidenceViolationCode =
  /** Campo numérico lido com valor não-finito (NaN, Infinity, -Infinity). */
  | 'NON_FINITE_NUMBER'
  /** Frequência lida fora do domínio [0, 100]. */
  | 'FREQUENCY_OUT_OF_RANGE'
  /** Soma das frequências do cenário fora da tolerância declarada. */
  | 'FREQUENCY_SUM_MISMATCH'
  /** Soma não verificável: há frequência ilegível no cenário. */
  | 'FREQUENCY_SUM_UNVERIFIABLE'
  /** Soma de combos das ações diverge do total declarado do jogador. */
  | 'COMBO_CONSERVATION_MISMATCH'
  /** Conservação de combos não verificável: combo ilegível/ausente. */
  | 'COMBO_CONSERVATION_UNVERIFIABLE'
  /** Cenário sem nenhuma ação — não há o que comparar. */
  | 'EMPTY_ACTION_SET'
  /**
   * Os dois cenários oferecem conjuntos de ações diferentes.
   *
   * SEVERIDADE `warning`, E ISSO É DELIBERADO. ChipEV e ICMev são modelos
   * essencialmente diferentes: um maximiza fichas, o outro maximiza equity de
   * premiação sob ICM. Não há razão para esperar que ofereçam ou usem o mesmo
   * conjunto de ações, e tratar a divergência como erro codificaria uma
   * expectativa de simetria que o domínio não sustenta.
   *
   * Ausência de ação e incompatibilidade de conjunto são RESTRIÇÃO DO SOLVER —
   * fato observado sobre a árvore que cada motor construiu —, não defeito do
   * dado transcrito. O par é sinalizado para que ninguém o compare
   * ação-a-ação por engano, e segue sendo evidência legítima.
   */
  | 'ACTION_SET_INCOMPARABLE'
  /**
   * As classes de ação correspondem (mesma árvore de referência), mas os
   * sizings absolutos em bb divergem além da tolerância. NÃO é incompatível:
   * quando os dois solvers modelam stacks diferentes, o mesmo ramo acumula
   * potes diferentes e portanto sizings diferentes. A correspondência de ramo
   * existe, mas não é verificável pela captura, que não expõe o pote de ambos.
   */
  | 'SIZING_CORRESPONDENCE_UNVERIFIABLE'
  /** Contexto estruturalmente inválido (posições ausentes/duplicadas). */
  | 'INVALID_PLAYER_SET'
  /**
   * Procedência ausente ou parcial: falta build, e-Nash, ou a unidade sem a
   * qual o e-Nash não se interpreta.
   *
   * SEVERIDADE `warning`, e a distinção importa: o par continua sendo evidência
   * legítima do que a captura mostrou. O que ele NÃO sustenta é a alegação de
   * REPRODUTIBILIDADE, e é só essa alegação que o ledger exige antes de mexer
   * numa constante de `solveIcmDistortion`. Reprovar como `error` descartaria
   * sete pares honestos; silenciar deixaria a barreira existir apenas em prosa.
   */
  | 'PROVENANCE_INCOMPLETE';

/**
 * `error`  — o dado viola o contrato e não pode ser usado como evidência.
 * `warning`— o dado é honesto porém incompleto: a invariante não pôde ser
 *            verificada porque algo é ilegível. NÃO é o mesmo que aprovado,
 *            e NÃO é o mesmo que reprovado.
 */
export type EvidenceViolationSeverity = 'error' | 'warning';

export interface EvidenceViolation {
  code: EvidenceViolationCode;
  severity: EvidenceViolationSeverity;
  /** Caminho do campo dentro do par, ex.: 'icmEv.actions[2].frequencyPct'. */
  path: string;
  message: string;
  /** Dados de apoio da verificação (soma medida, tolerância aplicada, etc.). */
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 6. Tolerâncias declaradas
// ---------------------------------------------------------------------------

/**
 * Tolerância padrão, em pontos percentuais, para o fechamento da soma de
 * frequências de um cenário.
 *
 * Justificativa: as capturas exibem frequências já arredondadas para uma casa
 * decimal. Um cenário com poucas ações pode legitimamente somar 100.1% por
 * acúmulo de arredondamento de exibição. 0.5pp cobre esse acúmulo com folga e
 * continua reprovando divergência material (105% é reprovado).
 *
 * É PARÂMETRO, não constante enterrada no meio do algoritmo: quem valida pode
 * apertar ou afrouxar conscientemente via `EvidenceValidationOptions`.
 */
export const DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT = 0.5;

/**
 * Tolerância padrão, em combos absolutos, para a conservação de combos.
 * Capturas arredondam combos fracionários; 0.5 combo cobre o arredondamento
 * de exibição sem tolerar perda ou criação real de combos.
 */
export const DEFAULT_COMBO_CONSERVATION_TOLERANCE = 0.5;

/**
 * Tolerância absoluta, em big blinds, para considerar dois sizings o MESMO
 * ramo da árvore.
 *
 * Justificativa medida: solvers diferentes exibem o mesmo ramo com precisões
 * diferentes. Num pote de 5.63 bb, a aposta de 25% aparece como `Bet 1.4` num
 * solver e `bets 1.41bb` no outro; 50% aparece como `2.8` e `2.81`; 75% como
 * `4.2` e `4.22`. São o mesmo ramo. Já `Raise 23.4` contra `raises 17.44bb`
 * são ramos distintos, e nenhuma tolerância razoável os une.
 */
export const DEFAULT_SIZING_EQUIVALENCE_TOLERANCE_BB = 0.05;

/**
 * Componente relativa da equivalência de sizing. Sizings grandes carregam
 * arredondamento proporcionalmente maior; a tolerância efetiva é o maior entre
 * a absoluta e esta fração do maior sizing comparado.
 */
export const DEFAULT_SIZING_EQUIVALENCE_RELATIVE = 0.01;

export interface EvidenceValidationOptions {
  /** Tolerância em pontos percentuais para a soma de frequências. */
  frequencySumTolerancePct?: number;
  /** Tolerância em combos absolutos para a conservação de combos. */
  comboConservationTolerance?: number;
  /** Tolerância absoluta, em bb, para equivalência de sizing entre solvers. */
  sizingEquivalenceToleranceBb?: number;
  /** Componente relativa da equivalência de sizing (fração do maior sizing). */
  sizingEquivalenceRelative?: number;
}

export interface ResolvedEvidenceTolerances {
  frequencySumTolerancePct: number;
  comboConservationTolerance: number;
  sizingEquivalenceToleranceBb: number;
  sizingEquivalenceRelative: number;
}

/** Resolve as tolerâncias efetivas, deixando-as explícitas para o relatório. */
export function resolveTolerances(
  options: EvidenceValidationOptions = {},
): ResolvedEvidenceTolerances {
  const naoNegativo = ( v: unknown, padrao: number ): number =>
    typeof v === 'number' && Number.isFinite( v ) && v >= 0 ? v : padrao;

  return {
    frequencySumTolerancePct: naoNegativo(
      options.frequencySumTolerancePct,
      DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT,
    ),
    comboConservationTolerance: naoNegativo(
      options.comboConservationTolerance,
      DEFAULT_COMBO_CONSERVATION_TOLERANCE,
    ),
    sizingEquivalenceToleranceBb: naoNegativo(
      options.sizingEquivalenceToleranceBb,
      DEFAULT_SIZING_EQUIVALENCE_TOLERANCE_BB,
    ),
    sizingEquivalenceRelative: naoNegativo(
      options.sizingEquivalenceRelative,
      DEFAULT_SIZING_EQUIVALENCE_RELATIVE,
    ),
  };
}

// ---------------------------------------------------------------------------
// 7. Validação
// ---------------------------------------------------------------------------

function violation(
  code: EvidenceViolationCode,
  severity: EvidenceViolationSeverity,
  path: string,
  message: string,
  details?: Record<string, unknown>,
): EvidenceViolation {
  return details === undefined
    ? { code, severity, path, message }
    : { code, severity, path, message, details };
}

/**
 * Lê um campo numérico registrando violação de não-finitude.
 * Retorna `null` quando o valor é ilegível OU inválido — em ambos os casos
 * ele NÃO entra em nenhuma soma. Ilegível nunca vira zero.
 */
function readFinite(
  measured: MeasuredNumber | undefined,
  path: string,
  out: EvidenceViolation[],
): number | null {
  if ( measured === undefined || isUnreadable( measured ) ) return null;
  const { value } = measured;
  if ( typeof value !== 'number' || !Number.isFinite( value ) ) {
    out.push(
      violation(
        'NON_FINITE_NUMBER',
        'error',
        path,
        'Campo numérico lido com valor não-finito. Use { kind: "unreadable" } para representar ausência.',
        { value: String( value ) },
      ),
    );
    return null;
  }
  return value;
}

/**
 * Classe semântica de uma ação, derivada do rótulo exibido.
 *
 * POR QUE NÃO COMPARAR RÓTULO LITERAL: solvers diferentes nomeiam o mesmo ramo
 * de formas diferentes — `Check` contra `checks`, `Bet 1.4 (25%)` contra
 * `bets 1.41bb`. Comparar texto reprovaria 100% dos pares reais e não
 * discriminaria nada. O que define o ramo é a CLASSE da ação, não a grafia.
 *
 * `allin` é normalizado para `raise`: um all-in é um raise de tamanho máximo,
 * e um solver pode exibi-lo como `Allin 35 (87%)` enquanto o outro escreve
 * `raises 32.81bb`. São o mesmo ramo da árvore.
 */
export type ActionClass = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'unknown';

export function classifyAction( label: string ): ActionClass {
  const l = String( label ).trim().toLowerCase();
  if ( /^folds?\b/.test( l ) ) return 'fold';
  if ( /^che(ck|cks)\b/.test( l ) ) return 'check';
  if ( /^calls?\b/.test( l ) ) return 'call';
  // all-in antes de raise: 'Allin 35' não deve cair em 'unknown'.
  if ( /\ball[- ]?in\b|^allin\b/.test( l ) ) return 'raise';
  if ( /^raises?\b/.test( l ) ) return 'raise';
  if ( /^bets?\b/.test( l ) ) return 'bet';
  return 'unknown';
}

/**
 * A classe da ação DENTRO do cenário em que ela aparece.
 *
 * O rótulo sozinho não decide entre `bet` e `raise`, e a Etapa B expôs o caso:
 * no nó de river em que o BB age primeiro, o GTO Wizard escreve
 * `Allin 27.2 (87%)` enquanto o HRC escreve `bets 24.94bb`. O mesmo ramo —
 * apostar toda a stack sem que haja aposta pendente — era classificado `raise`
 * de um lado e `bet` do outro, puramente pela grafia. Isso é exatamente o
 * defeito que `classifyAction` foi criada para eliminar, reaparecendo um nível
 * acima.
 *
 * O discriminante é regra de pôquer, não heurística: **não se aumenta onde se
 * pode pedir mesa**. Se o cenário oferece `check`, não há aposta pendente, e
 * toda ação agressiva ali é `bet` — inclusive o all-in.
 *
 * Por que `check` e não `fold`: um `fold` a 0% aparece no HRC mesmo sem aposta
 * pendente (par 1, o BB liderando o flop). `fold` não discrimina; `check` sim,
 * porque pedir mesa e pagar são mutuamente excludentes.
 *
 * Isto NÃO faz par algum passar: no par 4 as contagens seguem divergentes
 * (2 sizings de bet contra 3). O que muda é o motivo reportado deixar de ser
 * um artefato do classificador e passar a ser a diferença real entre as duas
 * árvores.
 */
export function classifyActionNoCenario(
  label: string,
  scenario: EvidenceScenario,
): ActionClass {
  const classe = classifyAction( label );
  if ( classe !== 'raise' ) return classe;
  const acoes = Array.isArray( scenario.actions ) ? scenario.actions : [];
  const podePedirMesa = acoes.some( a => classifyAction( a.label ) === 'check' );
  return podePedirMesa ? 'bet' : 'raise';
}

/** Sizings equivalentes dentro da tolerância declarada (absoluta ou relativa). */
function sizingsEquivalentes(
  a: number,
  b: number,
  t: ResolvedEvidenceTolerances,
): boolean {
  const folga = Math.max(
    t.sizingEquivalenceToleranceBb,
    Math.max( Math.abs( a ), Math.abs( b ) ) * t.sizingEquivalenceRelative,
  );
  return Math.abs( a - b ) <= folga;
}

/**
 * Percentual do pote declarado NO RÓTULO, quando o solver o expõe
 * (ex.: `Bet 2.8 (50%)` → 50). O HRC não expõe percentual, só bb — por isso
 * este discriminante só é aplicado quando AMBOS os lados o oferecem.
 */
function percentualDoRotulo( label: string ): number | null {
  // Quantificadores limitados: evita o backtracking super-linear que um
  // `\d+(?:[.,]\d+)?\s*%` permite em entrada adversarial.
  const m = /(\d{1,4}(?:[.,]\d{1,3})?) {0,3}%/.exec( String( label ) );
  const capturado = m?.[ 1 ];
  if ( capturado === undefined ) return null;
  const v = Number( capturado.replace( ',', '.' ) );
  return Number.isFinite( v ) ? v : null;
}

interface PerfilDeAcoes {
  /** Quantas ações de cada classe, após descartar folds inaplicáveis. */
  contagem: Record<ActionClass, number>;
  /** Sizings lidos por classe, em ordem crescente. */
  sizings: Record<ActionClass, number[]>;
  /** Percentuais declarados no rótulo, por classe, em ordem crescente. */
  percentuais: Record<ActionClass, number[]>;
}

/**
 * Um `fold` a 0% presente em apenas um dos cenários é diferença de EXIBIÇÃO,
 * não de árvore: fold não é opção legal quando não há aposta pendente, e um
 * solver pode listá-lo a 0% enquanto o outro o omite.
 */
function perfilar(
  scenario: EvidenceScenario,
  outroTemFold: boolean,
): PerfilDeAcoes {
  const contagem: Record<ActionClass, number> = {
    fold: 0, check: 0, call: 0, bet: 0, raise: 0, unknown: 0,
  };
  const sizings: Record<ActionClass, number[]> = {
    fold: [], check: [], call: [], bet: [], raise: [], unknown: [],
  };
  const percentuais: Record<ActionClass, number[]> = {
    fold: [], check: [], call: [], bet: [], raise: [], unknown: [],
  };

  for ( const acao of scenario.actions ) {
    const classe = classifyActionNoCenario( acao.label, scenario );
    if ( classe === 'fold' && !outroTemFold ) {
      const f = acao.frequencyPct;
      if ( f !== undefined && isRead( f ) && f.value === 0 ) continue;
    }
    contagem[ classe ] += 1;
    const s = acao.sizingBb;
    if ( s !== undefined && isRead( s ) && Number.isFinite( s.value ) ) {
      sizings[ classe ].push( s.value );
    }
    const pct = percentualDoRotulo( acao.label );
    if ( pct !== null ) percentuais[ classe ].push( pct );
  }
  for ( const classe of Object.keys( sizings ) as ActionClass[] ) {
    sizings[ classe ].sort( ( x, y ) => x - y );
    percentuais[ classe ].sort( ( x, y ) => x - y );
  }
  return { contagem, sizings, percentuais };
}

function temFold( scenario: EvidenceScenario ): boolean {
  return scenario.actions.some( a => classifyAction( a.label ) === 'fold' );
}

function validateContext( context: EvidenceContext, out: EvidenceViolation[] ): void {
  readFinite( context.potBb, 'context.potBb', out );

  const players = Array.isArray( context.players ) ? context.players : [];
  const oop = players.filter( p => p.position === 'OOP' ).length;
  const ip = players.filter( p => p.position === 'IP' ).length;
  if ( oop !== 1 || ip !== 1 ) {
    out.push(
      violation(
        'INVALID_PLAYER_SET',
        'error',
        'context.players',
        'O contexto precisa declarar exatamente um jogador OOP e um IP.',
        { oopCount: oop, ipCount: ip },
      ),
    );
  }

  players.forEach( ( player, i ) => {
    readFinite( player.stackBb, `context.players[${ i }].stackBb`, out );
  } );
}

/**
 * Verifica a procedência do cenário e reporta o que falta para sustentar
 * reprodutibilidade. NUNCA infere: campo ausente é reportado, não completado.
 */
export function camposDeProcedenciaFaltando( scenario: EvidenceScenario ): string[] {
  const p = scenario.provenance;
  if ( p === undefined ) return [ 'provenance' ];

  const faltando: string[] = [];
  if ( p.build === undefined || isUnreadable( p.build ) ) faltando.push( 'build' );
  if ( p.eNash === undefined || isUnreadable( p.eNash ) ) {
    faltando.push( 'eNash' );
  } else if ( p.eNashUnit === undefined || isUnreadable( p.eNashUnit ) ) {
    // Unidade só é exigível quando há e-Nash lido: sem número, a unidade não
    // descreve nada, e cobrá-la seria ruído.
    faltando.push( 'eNashUnit' );
  }
  return faltando;
}

function validateProvenance(
  scenario: EvidenceScenario,
  scenarioPath: string,
  out: EvidenceViolation[],
): void {
  // readFinite já devolve null para ausente e para ilegível; o que ele acrescenta
  // aqui é reportar NON_FINITE_NUMBER num e-Nash lido como NaN/Infinity.
  readFinite( scenario.provenance?.eNash, `${ scenarioPath }.provenance.eNash`, out );

  const faltando = camposDeProcedenciaFaltando( scenario );
  if ( faltando.length > 0 ) {
    out.push(
      violation(
        'PROVENANCE_INCOMPLETE',
        'warning',
        `${ scenarioPath }.provenance`,
        'Procedência incompleta: o cenário não sustenta alegação de reprodutibilidade. Continua sendo evidência válida do que a captura mostrou.',
        { solver: scenario.solver, camposFaltando: faltando },
      ),
    );
  }
}

function validateScenario(
  scenario: EvidenceScenario,
  scenarioPath: string,
  tolerances: ResolvedEvidenceTolerances,
  out: EvidenceViolation[],
): void {
  validateProvenance( scenario, scenarioPath, out );

  const actions = Array.isArray( scenario.actions ) ? scenario.actions : [];

  if ( actions.length === 0 ) {
    out.push(
      violation(
        'EMPTY_ACTION_SET',
        'error',
        `${ scenarioPath }.actions`,
        'Cenário sem ações: não há evidência a comparar.',
      ),
    );
    return;
  }

  let freqSum = 0;
  let freqUnreadable = 0;

  let comboSum = 0;
  let comboMissing = 0;

  actions.forEach( ( action, i ) => {
    const actionPath = `${ scenarioPath }.actions[${ i }]`;

    // Sizing: apenas finitude; sizing ausente é legítimo (Check/Fold).
    readFinite( action.sizingBb, `${ actionPath }.sizingBb`, out );

    // Frequência.
    const freqPath = `${ actionPath }.frequencyPct`;
    if ( action.frequencyPct === undefined || isUnreadable( action.frequencyPct ) ) {
      freqUnreadable += 1;
    } else {
      const freq = readFinite( action.frequencyPct, freqPath, out );
      if ( freq === null ) {
        // Não-finito já reportado; não contamina a soma nem vira zero.
        freqUnreadable += 1;
      } else {
        if ( freq < 0 || freq > 100 ) {
          out.push(
            violation(
              'FREQUENCY_OUT_OF_RANGE',
              'error',
              freqPath,
              'Frequência fora do domínio [0, 100].',
              { value: freq },
            ),
          );
        }
        freqSum += freq;
      }
    }

    // Combos da ação.
    const comboPath = `${ actionPath }.combos`;
    if ( action.combos === undefined || isUnreadable( action.combos ) ) {
      comboMissing += 1;
    } else {
      const combos = readFinite( action.combos, comboPath, out );
      if ( combos === null ) comboMissing += 1;
      else comboSum += combos;
    }
  } );

  // --- Fechamento das frequências ---
  const freqPath = `${ scenarioPath }.actions`;
  if ( freqUnreadable > 0 ) {
    out.push(
      violation(
        'FREQUENCY_SUM_UNVERIFIABLE',
        'warning',
        freqPath,
        'Soma de frequências não verificável: há frequência ilegível no cenário. Campo ilegível NÃO é tratado como zero.',
        {
          readableSumPct: freqSum,
          unreadableCount: freqUnreadable,
          actionCount: actions.length,
        },
      ),
    );
  } else if ( Math.abs( freqSum - 100 ) > tolerances.frequencySumTolerancePct ) {
    out.push(
      violation(
        'FREQUENCY_SUM_MISMATCH',
        'error',
        freqPath,
        'Soma das frequências fora da tolerância declarada. Nenhuma redistribuição foi aplicada.',
        {
          sumPct: freqSum,
          expectedPct: 100,
          deviationPct: freqSum - 100,
          tolerancePct: tolerances.frequencySumTolerancePct,
        },
      ),
    );
  }

  // --- Conservação de combos ---
  const totalPath = `${ scenarioPath }.totalCombos`;
  // PRESENTE, não LIDO. Declarar `unreadable()` é uma afirmação positiva do
  // transcritor -- "olhei e não deu para ler" -- e é diferente de omitir o
  // campo. Exigir `isRead` aqui colapsava as duas coisas e silenciava o aviso
  // de não-verificabilidade justamente no caso que o contrato existe para
  // distinguir.
  const hasTotalField = scenario.totalCombos !== undefined;
  const total = readFinite( scenario.totalCombos, totalPath, out );

  if ( total !== null && comboMissing === 0 ) {
    if ( Math.abs( comboSum - total ) > tolerances.comboConservationTolerance ) {
      out.push(
        violation(
          'COMBO_CONSERVATION_MISMATCH',
          'error',
          `${ scenarioPath }.combos`,
          'Soma de combos das ações diverge do total de combos do jogador.',
          {
            actionComboSum: comboSum,
            totalCombos: total,
            deviation: comboSum - total,
            tolerance: tolerances.comboConservationTolerance,
          },
        ),
      );
    }
  } else if ( hasTotalField || comboMissing < actions.length ) {
    // Há evidência parcial de combos: a invariante existe mas não fecha o
    // circuito. Reportar como não verificável, jamais completar com zero.
    out.push(
      violation(
        'COMBO_CONSERVATION_UNVERIFIABLE',
        'warning',
        `${ scenarioPath }.combos`,
        'Conservação de combos não verificável: combos parcialmente legíveis/ausentes.',
        {
          actionComboSum: comboSum,
          missingActionCombos: comboMissing,
          totalCombosRead: total,
        },
      ),
    );
  }
}

/**
 * Valida um par de evidência e DEVOLVE as violações encontradas.
 * Não lança exceção, não muta o par, não normaliza nada.
 *
 * @param pair    - Par de evidência (mesmo nó, dois regimes).
 * @param options - Tolerâncias explícitas; ver `DEFAULT_*` para os padrões.
 */
export function validateEvidencePair(
  pair: EvidencePair,
  options: EvidenceValidationOptions = {},
): EvidenceViolation[] {
  const out: EvidenceViolation[] = [];
  const tolerances = resolveTolerances( options );

  validateContext( pair.context, out );
  validateScenario( pair.chipEv, 'chipEv', tolerances, out );
  validateScenario( pair.icmEv, 'icmEv', tolerances, out );

  // --- Comparabilidade dos dois cenários ---
  const chipActions = Array.isArray( pair.chipEv.actions ) ? pair.chipEv.actions : [];
  const icmActions = Array.isArray( pair.icmEv.actions ) ? pair.icmEv.actions : [];

  if ( chipActions.length > 0 && icmActions.length > 0 ) {
    const chipTemFold = temFold( pair.chipEv );
    const icmTemFold = temFold( pair.icmEv );
    const chip = perfilar( pair.chipEv, icmTemFold );
    const icm = perfilar( pair.icmEv, chipTemFold );

    const classes: ActionClass[] = [ 'fold', 'check', 'call', 'bet', 'raise', 'unknown' ];
    const divergentes = classes.filter(
      c => chip.contagem[ c ] !== icm.contagem[ c ],
    );

    // Percentuais declarados no rótulo só discriminam quando AMBOS os lados os
    // expõem. O GTO Wizard escreve `Bet 2.8 (50%)`; o HRC escreve `bets 2.81bb`
    // e não declara percentual algum.
    const percentuaisDivergentes: Record<string, unknown>[] = [];
    for ( const classe of [ 'bet', 'raise' ] as ActionClass[] ) {
      const a = chip.percentuais[ classe ];
      const b = icm.percentuais[ classe ];
      if ( a.length === 0 || b.length === 0 || a.length !== b.length ) continue;
      a.forEach( ( pct, i ) => {
        const outro = b[ i ];
        if ( outro !== undefined && pct !== outro ) {
          percentuaisDivergentes.push( { classe, indice: i, chipEvPct: pct, icmEvPct: outro } );
        }
      } );
    }

    if ( divergentes.length > 0 || percentuaisDivergentes.length > 0 ) {
      out.push(
        violation(
          'ACTION_SET_INCOMPARABLE',
          'warning',
          'pair.actions',
          'Os cenários oferecem conjuntos de ações diferentes. Isso é restrição do solver -- ChipEV e ICMev são modelos essencialmente distintos e não precisam oferecer as mesmas ações --, não defeito do dado. O par é sinalizado para não ser comparado ação-a-ação, e segue sendo evidência válida.',
          {
            classesDivergentes: divergentes,
            percentuaisDivergentes,
            chipEvPorClasse: chip.contagem,
            icmEvPorClasse: icm.contagem,
          },
        ),
      );
    } else {
      // Classes batem: a ÁRVORE DE REFERÊNCIA é a mesma. Resta conferir se os
      // sizings absolutos também correspondem. Quando não correspondem, isso
      // NÃO invalida o par — dois solvers que modelam stacks diferentes
      // acumulam potes diferentes no mesmo ramo. Fica como não verificável.
      const naoCorrespondem: Record<string, unknown>[] = [];
      for ( const classe of [ 'bet', 'raise' ] as ActionClass[] ) {
        const a = chip.sizings[ classe ];
        const b = icm.sizings[ classe ];
        if ( a.length !== b.length ) continue;
        a.forEach( ( valor, i ) => {
          const par = b[ i ];
          if ( par !== undefined && !sizingsEquivalentes( valor, par, tolerances ) ) {
            naoCorrespondem.push( { classe, indice: i, chipEvBb: valor, icmEvBb: par } );
          }
        } );
      }
      if ( naoCorrespondem.length > 0 ) {
        out.push(
          violation(
            'SIZING_CORRESPONDENCE_UNVERIFIABLE',
            'warning',
            'pair.actions',
            'As classes de ação correspondem, mas os sizings em bb divergem. Solvers que modelam stacks diferentes acumulam potes diferentes no mesmo ramo; a captura não expõe o pote de ambos os lados, então a correspondência de ramo não é verificável.',
            {
              divergencias: naoCorrespondem,
              toleranciaAbsolutaBb: tolerances.sizingEquivalenceToleranceBb,
              toleranciaRelativa: tolerances.sizingEquivalenceRelative,
            },
          ),
        );
      }
    }
  }

  return out;
}

/** Conveniência: o par tem alguma violação de severidade `error`? */
export function hasBlockingViolation( violations: EvidenceViolation[] ): boolean {
  return violations.some( v => v.severity === 'error' );
}

// ---------------------------------------------------------------------------
// 8. Reprodutibilidade — o discriminante que autoriza calibrar
// ---------------------------------------------------------------------------

export interface ReproducibilityAssessment {
  /** Verdadeiro só quando AMBOS os regimes declaram procedência completa. */
  reproducible: boolean;
  /** Campos faltantes por regime; vazio quando o lado está completo. */
  missing: { chipEv: string[]; icmEv: string[] };
}

/**
 * Um par é REPRODUZÍVEL quando os dois lados declaram build e e-Nash com
 * unidade — nunca por consistência interna, por mais densa que ela fique.
 *
 * POR QUE ESTA FUNÇÃO EXISTE:
 *   `AULA_1_2_EVIDENCE_LEDGER.md` condiciona qualquer ajuste de constante em
 *   `solveIcmDistortion` a "ao menos três pares independentes E REPRODUZÍVEIS".
 *   Até aqui, "reproduzível" era uma palavra em documento: nada no código
 *   sabia distinguir um par reproduzível de um par apenas consistente, e a
 *   separação dependia de quem estivesse lendo lembrar dela.
 *
 *   Os sete pares da Aula 1.2 são transcrições de captura de terceiro. São
 *   consistentes — sete somas de frequência fechando, combos conservados,
 *   uma verificação cruzada dígito a dígito por `image59.png` — e nada disso
 *   os torna reproduzíveis. Consistência é ausência de contradição interna;
 *   reprodutibilidade é outra pessoa poder rodar o mesmo solve e obter o mesmo
 *   número, o que exige saber QUAL solve foi rodado.
 *
 * ESTA FUNÇÃO RETORNA `false` PARA OS SETE PARES ATUAIS, E ISSO É O ESPERADO.
 * Ela não é um teste que se conserta: é o portão que se abre quando o export
 * do HRC trouxer o que a captura não trazia.
 */
export function assessReproducibility( pair: EvidencePair ): ReproducibilityAssessment {
  const chipEv = camposDeProcedenciaFaltando( pair.chipEv );
  const icmEv = camposDeProcedenciaFaltando( pair.icmEv );
  return {
    reproducible: chipEv.length === 0 && icmEv.length === 0,
    missing: { chipEv, icmEv },
  };
}

/**
 * Quantos pares do conjunto são reproduzíveis. O ledger exige três.
 *
 * Não confundir com "quantos são válidos": os sete são válidos hoje, e zero
 * são reproduzíveis. Contar validade no lugar de reprodutibilidade é
 * exatamente o erro que abriria a calibração cedo demais.
 */
export function countReproduciblePairs( pairs: readonly EvidencePair[] ): number {
  return pairs.filter( p => assessReproducibility( p ).reproducible ).length;
}
