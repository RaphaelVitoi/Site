/**
 * Evidência primária — Aula 1.2, pares ChipEV × ICMev.
 *
 * ETAPA A (pares 1-3): flop e turn. ETAPA B (par 4): river.
 * ETAPA C (pares 5-7): a linha de check-raise do flop ao turn, que amarra
 * os quatro anteriores numa cadeia aritmetica continua. O par 7 REVERTE uma
 * rejeicao da Etapa A que se apoiava em contagem de insercoes em vez de
 * leitura da captura -- ver o docblock de PAR_7_BB_VS_CBET_SMALL.
 *
 * PROCEDÊNCIA
 * Documento de estudo autoral de Raphael Vitoi, mantido FORA do repositório.
 * SHA-256 conferido contra `docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md`
 * antes da transcrição. As capturas não são replicadas aqui: apenas os valores
 * lidos, com a procedência de cada um.
 *
 * MÉTODO — dupla leitura cega
 * Dois leitores independentes transcreveram as mesmas catorze capturas sem
 * acesso à leitura um do outro — seis na Etapa A, duas na Etapa B, seis na
 * Etapa C. Resultado: concordância total em todos os dígitos, zero conflitos
 * nas três. A dupla leitura corrigiu três coisas que leitor único não pegaria,
 * e as três estão refletidas neste arquivo:
 *
 *   1. O glifo antes do campo EV é TRIÂNGULO DE DIREÇÃO, não sinal aritmético
 *      — provado internamente: o mesmo glifo precede `Equidade -35.2%`, e
 *      equidade não é negativa. Por isso EV NÃO É MODELADO aqui. Um leitor
 *      sozinho teria gravado seis sinais inventados sem que nada acusasse.
 *   2. A captura do par 3 não inclui o cabeçalho do GTO Wizard: o pote vem do
 *      pote central da mesa, não de um campo `Pot` declarado. Procedência
 *      diferente, registrada na nota do par.
 *   3. O total de combos do BB difere entre capturas do MESMO spot: 752.8,
 *      752.6 e -- desde a Etapa C, em `NODELOCK_IP_CBET_SMALL` -- 752.7. TRÊS
 *      valores para a mesma grandeza. Divergência da FONTE, não da leitura.
 *      Cada par carrega o valor da sua própria captura. Não se escolhe um, não
 *      se tira média.
 *
 * CORREÇÕES DO AUTOR DA FONTE, incorporadas após revisão
 *   4. A stack efetiva é 40bb NOS DOIS cenários antes do open do BTN. Uma
 *      versão anterior deste arquivo registrava 40/40 no ChipEV contra
 *      52.88/37.88 no ICMev, como se fossem efetivas distintas, e construía
 *      sobre isso uma explicação causal para o par 3. Ambas caíram.
 *   5. O HRC EXPÕE combos, stacks e e-Nash. O que falta é o RECORTE das
 *      capturas coladas no documento. Dizer "a ferramenta não expõe" tornaria
 *      o dado inalcançável; "o recorte não inclui" o torna pendente de nova
 *      captura — tarefa executável.
 *
 * O QUE ESTE ARQUIVO NÃO AUTORIZA
 * Sete pares transcritos NÃO são calibração. O ledger exige pares
 * independentes E REPRODUZÍVEIS; reprodutibilidade não foi obtida — estes
 * números são transcrição de captura de terceiro, não medição própria. Versão
 * de solver, build e e-Nash seguem ausentes DESTAS capturas, e o ledger os
 * exige. Nada aqui altera as constantes de `solveIcmDistortion`.
 */

import {
  read,
  unreadable,
  type EvidencePair,
  type EvidencePlayer,
} from '../evidenceContract';

/** SHA-256 do `Aula 1.2.docx`, minúsculo conforme o contrato. */
export const AULA_1_2_SHA256 =
  '7ca7c89f52c1a4173ee404f1bc4059cabd564fddfb62129a6cd34789b86e4769';

/**
 * ATENÇÃO À REDAÇÃO: o HRC **expõe** combos e stacks. O que falta é o RECORTE.
 *
 * As capturas coladas no documento são do painel `Quick Graph / Range`, que
 * mostra apenas a linha de legenda com as frequências e a grade de mãos. Os
 * painéis do HRC que trazem combos, stacks e e-Nash existem — simplesmente não
 * entraram neste recorte.
 *
 * A distinção não é semântica, é operacional: "a ferramenta não expõe" tornaria
 * o dado inalcançável e encerraria o assunto; "o recorte não inclui" o torna
 * PENDENTE DE NOVA CAPTURA, que é uma tarefa executável. Registrar o motivo
 * errado teria fechado uma porta que está aberta.
 *
 * Enquanto a recaptura não vem, o campo vai como `unreadable` — jamais como
 * zero. Os stacks do contexto vêm do lado ChipEV e do Table Draw do documento.
 */
const HRC_RECORTE_SEM_COMBOS =
  'recorte da captura (painel Quick Graph/Range) não inclui os combos; o HRC os expõe em outro painel';

/**
 * A STACK EFETIVA É A MESMA NOS DOIS CENÁRIOS: 40bb antes do open do BTN.
 *
 * O Table Draw mostra `BU 39.88bb` e `BB 53.88bb`, já líquidos do ante. A
 * efetiva é a menor das duas — 39.88, ou seja 40bb — e vale para o GTO Wizard
 * e para o HRC igualmente. Descontado o open de 2.00 do BU e o 1.00 com que o
 * BB completa o call sobre o post obrigatório, o pós-flop fica em 37.88 e
 * 52.88, com efetiva de 37.88: é o "BTN 38bbs / BB 53bbs" que o texto arredonda.
 *
 * Isso reconcilia os três conjuntos de números em circulação — 40/55 nominais,
 * 39.88/53.88 no draw, 38/53 na prosa — sem descartar nenhum.
 *
 * O QUE OS DOIS MOTORES NÃO COMPARTILHAM não é a stack efetiva: é o CONJUNTO
 * DE ASSENTOS que entra no cálculo. O GTO Wizard considera apenas os dois
 * jogadores ativos; o HRC carrega os nove assentos da mesa, e são essas stacks
 * restantes que alimentam o ICM. Um par heads-up de `EvidencePlayer` não
 * expressa isso, e por isso os cenários NÃO declaram `players` próprios: a
 * mesa completa fica em `MESA_COMPLETA_NO_OPEN`.
 */
export const MESA_COMPLETA_NO_OPEN = {
  nota:
    'Table Draw do documento, no instante do open do BU. Valores líquidos do ' +
    'ante. É o conjunto que o HRC usa para ICM e que o GTO Wizard ignora.',
  potBb: 2.63,
  assentos: {
    UTG: 9.25,
    EP: 52.24,
    MP1: 22.08,
    MP2: 6.88,
    HJ: 44.16,
    CO: 24.16,
    BU: 39.88,
    SB: 12.73,
    BB: 53.88,
  },
  acaoDoNo: 'BU raises 2.00bb; SB posts 0.50bb; BB posts 1.00bb',
  efetivaPreOpenBb: 39.88,
  efetivaPosFlopBb: 37.88,
} as const;

/** Stack efetiva declarada, idêntica para os dois regimes. */
const STACKS_EFETIVOS_FLOP: EvidencePlayer[] = [
  { id: 'BB', position: 'OOP', stackBb: read(40) },
  { id: 'BTN', position: 'IP', stackBb: read(40) },
];

/**
 * Board completo, do flop ao river, como o documento o exibe.
 * Os pares transcritos param no turn; o river consta para que as legendas de
 * nós de river do documento — marcadas `(3h)` — sejam interpretáveis.
 */
export const BOARD_ATE_O_RIVER = 'Kd Jc Ts 2d 3h' as const;

/**
 * Ranges pré-flop que produzem o spot. Capturas do HRC, painel Quick
 * Graph/Range, no formato `folds (x%) calls (y%) raises Nbb (z%)`.
 *
 * DUAS COISAS A NOTAR, e nenhuma delas é defeito:
 *
 * 1. A defesa do BB soma 100.1% — 17.1 + 64.4 + 3.7 + 6.5 + 8.4. É o MESMO
 *    arredondamento de exibição que aparece no par 2, agora num painel
 *    diferente e num solver diferente. Confirma que a tolerância declarada em
 *    `DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT` responde a um padrão da fonte, não
 *    a um caso isolado. NÃO normalizar.
 *
 * 2. O shove do BB é exibido como `raises 39.88bb` — exatamente a stack do BU
 *    no Table Draw. Um shove é limitado pela stack menor, então este número é
 *    CONFIRMAÇÃO INDEPENDENTE de que a efetiva é 39.88 ≈ 40bb. Chegou por um
 *    caminho diferente do Table Draw e bate.
 */
export const RANGES_PREFLOP = {
  /**
   * VALEM PARA OS DOIS REGIMES, sem exceção.
   *
   * O documento declara `RANGES: simétricos aos apresentados pelo HRC` e
   * `LINHAS ESTRATÉGICAS: simétricas`, e a introdução afirma que as árvores
   * pré-flop são idênticas em inputs e ranges nos dois motores.
   *
   * A consequência metodológica é o que importa: as diferenças observadas
   * pós-flop entre ChipEV e ICMev NÃO PODEM ser atribuídas a ranges de entrada
   * distintos, porque não há distinção. Uma variável confundidora óbvia fica
   * eliminada por construção — e é isso que dá valor comparativo aos pares.
   */
  aplicaSeAAmbosOsRegimes: true,
  solverDaCaptura: 'HRC',
  btnRfi: {
    rotuloDoDocumento: 'BTN RFI NA 33.6%',
    legendaLiteral: 'BU: folds (66.4%) raises 2.00bb (33.6%)',
    foldsPct: 66.4,
    raisesPct: 33.6,
    raiseSizingBb: 2.0,
    somaPct: 100.0,
  },
  bbDefense: {
    legendaLiteral:
      'BB: folds (17.1%) calls (64.4%) raises 5.50bb (3.7%) raises 8.00bb (6.5%) raises 39.88bb (8.4%)',
    foldPct: 17.1,
    callPct: 64.4,
    treebetSmall: { pct: 3.7, sizingBb: 5.5 },
    treebetPolar: { pct: 6.5, sizingBb: 8.0 },
    shove: { pct: 8.4, sizingBb: 39.88 },
    somaPct: 100.1,
    notaSoma:
      'Soma 100.1% por arredondamento de exibição. Registrada como medida; não normalizar.',
  },
} as const;

/**
 * PAR 1 — BB lidera no flop.
 *
 * ChipEV: figura 8 (`image49.png`), nó 2 do documento.
 * ICMev:  figura 46 (`image40.png`), nó 39 do documento.
 *
 * Sizings equivalentes entre solvers: 25% de 5.63 = 1.4075, exibido `Bet 1.4`
 * no GTO Wizard e `bets 1.41bb` no HRC. Mesma árvore.
 *
 * NOTA: o documento anota em prosa "7% de lead"; a captura mede 5.7%. O ledger
 * propagou o 7% da prosa. Aqui vale o medido.
 */
export const PAR_1_BB_LEADING: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 7, // 0-based; é a 8ª inserção de figura do documento
    nodeLabel: '2 Leading (ChipEV) / 39 Leading (IcmEV)',
  },
  context: {
    street: 'flop',
    board: read('Kd Jc Ts'),
    potBb: read(5.63),
    players: STACKS_EFETIVOS_FLOP,
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    totalCombos: read(752.8),
    actions: [
      { label: 'Check', frequencyPct: read(100), combos: read(752.61) },
      {
        label: 'Bet 1.4 (25%)',
        sizingBb: read(1.4),
        frequencyPct: read(0),
        combos: read(0.22),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      {
        label: 'folds',
        frequencyPct: read(0),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'checks',
        frequencyPct: read(94.3),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 1.41bb',
        sizingBb: read(1.41),
        frequencyPct: read(5.7),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * PAR 2 — BTN (IP) age após o check do BB.
 *
 * ChipEV: figura 9 (`image73.png`), nó 3.
 * ICMev:  figura 47 (`image25.png`), nó 41.
 *
 * Sizings equivalentes: pote 5.63 → 20% = 1.126 (~1.13), 50% = 2.815 (~2.81),
 * 75% = 4.2225 (~4.22). Mesma árvore nos dois solvers.
 *
 * A soma das frequências do lado ChipEV é 100.1% — arredondamento de exibição
 * do GTO Wizard. É REAL e fica. É precisamente o caso que exige tolerância
 * declarada em vez de normalização silenciosa.
 */
export const PAR_2_IP_APOS_CHECK: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 8,
    nodeLabel: '3 IP action após BB check / 41 IP action após BB check',
  },
  context: {
    street: 'flop',
    board: read('Kd Jc Ts'),
    potBb: read(5.63),
    players: STACKS_EFETIVOS_FLOP,
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    totalCombos: read(370.9),
    actions: [
      { label: 'Check', frequencyPct: read(2.3), combos: read(8.38) },
      {
        label: 'Bet 1.1 (20%)',
        sizingBb: read(1.1),
        frequencyPct: read(8.7),
        combos: read(32.14),
      },
      {
        label: 'Bet 2.8 (50%)',
        sizingBb: read(2.8),
        frequencyPct: read(82.5),
        combos: read(306.02),
      },
      {
        label: 'Bet 4.2 (75%)',
        sizingBb: read(4.2),
        frequencyPct: read(6.6),
        combos: read(24.4),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      { label: 'folds', frequencyPct: read(0), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      { label: 'checks', frequencyPct: read(23.6), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      {
        label: 'bets 1.13bb',
        sizingBb: read(1.13),
        frequencyPct: read(67.5),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 2.81bb',
        sizingBb: read(2.81),
        frequencyPct: read(7.5),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 4.22bb',
        sizingBb: read(4.22),
        frequencyPct: read(1.4),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * PAR 3 — IP reage à cbet do OOP no turn, após x-r no flop.
 *
 * ChipEV: figura 34 (`image9.png`), nó 28.
 * ICMev:  figura 51 (`image10.png`), nó 45.
 *
 * Escolhido porque `image9.png` e `image10.png` são as ÚNICAS capturas do par
 * sem reuso no documento.
 *
 * NOTA DE RETIFICAÇÃO (Etapa C): este comentário dizia também que "o nó 13 foi
 * descartado" porque `image7.png` é reciclada em quatro inserções com legendas
 * diferentes. O critério de ESCOLHA acima segue válido — ausência de reuso é
 * uma boa razão para começar por aqui —, mas a rejeição do nó 13 NÃO era. As
 * quatro legendas descrevem o mesmo nó em vistas diferentes, e o par existe:
 * `PAR_7_BB_VS_CBET_SMALL`.
 *
 * DOIS ALERTAS ESTRUTURAIS:
 *
 * 1. Cabeçalho ausente. Esta captura começa abaixo do cabeçalho do GTO Wizard,
 *    então o pote 23.43 vem do POTE CENTRAL DA MESA, não de um campo `Pot`
 *    declarado como nos pares 1 e 2. Procedência distinta.
 *
 * 2. Sizings de raise divergem — e isso é RESTRIÇÃO DO SOLVER, não defeito.
 *    ChipEV oferece `Raise 23.4` e `Allin 35`; ICMev oferece `raises 17.44bb`
 *    e `raises 32.81bb`. As CLASSES correspondem, e a árvore de referência é a
 *    mesma para os dois (Bet 20/50/75%, Raise 50%, all-in a partir de SPR 5,
 *    Donk 25% — ver `Settings da árvore pós flop` no documento).
 *
 *    A CAUSA DESSA DIVERGÊNCIA NÃO ESTÁ DETERMINADA, e é importante não
 *    inventá-la. Uma hipótese anterior — "os motores partem de stacks efetivas
 *    diferentes, logo acumulam potes diferentes" — foi DESCARTADA: a stack
 *    efetiva é 40bb nos dois cenários antes do open (ver
 *    `MESA_COMPLETA_NO_OPEN`), e o pote do flop é 5.63 em ambos, declarado
 *    simétrico pelo próprio documento.
 *
 *    O que se sabe: ChipEV e ICMev são modelos essencialmente diferentes, e
 *    divergência entre eles é restrição do solver, não defeito do dado. O que
 *    NÃO se sabe: por que este nó específico do turn produz 23.4/35 de um lado
 *    e 17.44/32.81 do outro. Determinar isso exige o pote do lado HRC, que o
 *    recorte não mostra.
 *
 *    Por isso o par NÃO é bloqueado: é sinalizado com
 *    `SIZING_CORRESPONDENCE_UNVERIFIABLE` para que ninguém o compare
 *    ação-a-ação por engano, e segue sendo evidência legítima.
 */
export const PAR_3_IP_VS_CBET_TURN: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 33,
    nodeLabel:
      '28 IP reaction vs cbet turn OOP after xR flop (2d) / 45 idem',
  },
  context: {
    // Remanescentes exibidos na mesa NESTE nó do turn — estado, não
    // configuração. A stack de referência do GTO Wizard continua sendo 40bb.
    street: 'turn',
    board: read('Kd Jc Ts 2d'),
    potBb: read(23.43),
    players: [
      { id: 'BB', position: 'OOP', stackBb: read(27.2) },
      { id: 'BTN', position: 'IP', stackBb: read(35) },
    ],
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    totalCombos: read(252),
    actions: [
      { label: 'Fold', frequencyPct: read(24.3), combos: read(61.32) },
      { label: 'Call', frequencyPct: read(74.8), combos: read(188.36) },
      {
        label: 'Raise 23.4 (50%)',
        sizingBb: read(23.4),
        frequencyPct: read(0),
        combos: read(0.01),
      },
      {
        label: 'Allin 35 (87%)',
        sizingBb: read(35),
        frequencyPct: read(0.9),
        combos: read(2.27),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      { label: 'folds', frequencyPct: read(28.3), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      { label: 'calls', frequencyPct: read(70.6), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      {
        label: 'raises 17.44bb',
        sizingBb: read(17.44),
        frequencyPct: read(0.8),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'raises 32.81bb',
        sizingBb: read(32.81),
        frequencyPct: read(0.3),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * PAR 4 — BB (OOP) age no RIVER, depois que o IP paga o turn.
 *
 * ChipEV: figura 35 (`image80.png`), nó 29.
 * ICMev:  figura 52 (`image43.png`), nó 46.
 *
 * Ambas as capturas aparecem UMA ÚNICA VEZ no documento — verificado contra as
 * 97 inserções de figura sobre 84 arquivos: nada de reuso, ao contrário de
 * `image7.png` (4 inserções, 4 legendas) e dos nós 74/75/76, que reciclam as
 * capturas de 39/41/42.
 *
 * ESTE PAR É A CONTINUAÇÃO DIRETA DO PAR 3, e a aritmética fecha sozinha —
 * ver `CADEIA_TURN_RIVER`. É a primeira verificação da Etapa A por uma captura
 * que não participou dela.
 *
 * DUAS OBSERVAÇÕES, nenhuma delas defeito:
 *
 * 1. O ICMev oferece TRÊS sizings de aposta (6.30 / 15.75 / 24.94bb) onde o
 *    ChipEV oferece DUAS (7.80 e o all-in de 27.2). A divergência é de
 *    cardinalidade da árvore, não de grafia — e por isso o par é sinalizado
 *    `ACTION_SET_INCOMPARABLE`, que é aviso, não erro.
 *
 *    O que mudou desde o par 3: o all-in do ChipEV aqui NÃO é um raise. O BB
 *    age primeiro no river, sem aposta pendente, então `Allin 27.2` e
 *    `bets 24.94bb` são o mesmo tipo de ramo. `classifyActionNoCenario` passou
 *    a normalizar isso; sem a correção, o relatório acusaria uma diferença
 *    `raise 1 × 0` que só existia na nomenclatura. A divergência real (2 bets
 *    contra 3) permanece e continua sendo reportada.
 *
 * 2. A soma das frequências do ICMev é 100.1% — 30.7 + 1.1 + 22.5 + 45.8.
 *    Terceira ocorrência do mesmo arredondamento de exibição, e a PRIMEIRA no
 *    HRC pós-flop (as anteriores foram o GTO Wizard no par 2 e o HRC no painel
 *    pré-flop). Três painéis diferentes, dois solvers: é padrão da fonte.
 *    Não normalizar.
 *
 * O QUE NÃO SE SABE: o pote do lado HRC continua fora do recorte. Os sizings
 * 6.30 e 15.75 seriam 20% e 50% de um pote de 31.50 — próximo dos 31.23 do
 * ChipEV, e coerente com a árvore declarada —, mas 31.50 é ARITMÉTICA
 * REVERSA, não leitura. Não entra como valor medido e não vira explicação.
 */
export const PAR_4_OOP_RIVER: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 34, // 0-based; 35ª inserção de figura
    nodeLabel:
      '29 OOP action river after IP calls turn (river 3h) / 46 idem',
  },
  context: {
    street: 'river',
    board: read(BOARD_ATE_O_RIVER),
    potBb: read(31.23),
    // Remanescentes exibidos NESTE nó. A stack de referência do GTO Wizard
    // continua sendo 40bb; ver MESA_COMPLETA_NO_OPEN.
    players: [
      { id: 'BB', position: 'OOP', stackBb: read(27.2) },
      { id: 'BTN', position: 'IP', stackBb: read(27.2) },
    ],
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    // Painel superior direito, linha `Combos` do BB (jogador da vez).
    totalCombos: read(27.8),
    actions: [
      { label: 'Check', frequencyPct: read(33.7), combos: read(9.38) },
      {
        label: 'Bet 7.8 (25%)',
        sizingBb: read(7.8),
        frequencyPct: read(0.2),
        combos: read(0.05),
      },
      {
        label: 'Allin 27.2 (87%)',
        sizingBb: read(27.2),
        frequencyPct: read(66.1),
        combos: read(18.39),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      {
        label: 'checks',
        frequencyPct: read(30.7),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 6.30bb',
        sizingBb: read(6.3),
        frequencyPct: read(1.1),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 15.75bb',
        sizingBb: read(15.75),
        frequencyPct: read(22.5),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 24.94bb',
        sizingBb: read(24.94),
        frequencyPct: read(45.8),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * A CADEIA TURN → RIVER, e por que ela vale mais que os pares isolados.
 *
 * Os pares 3 e 4 foram transcritos de capturas diferentes, em sessões
 * diferentes, sem que a leitura de uma informasse a outra. Encaixadas, fecham
 * uma aritmética que nenhuma das duas contém sozinha:
 *
 *   pote do turn        23.43  (par 3, pote central da mesa)
 *   + call do IP         7.80
 *   = pote do river     31.23  (par 4, campo declarado)          ✓
 *
 *   stack do IP no turn 35.00  (par 3)
 *   − call do IP         7.80
 *   = 27.20 = stack do IP no river, e = stack do OOP             ✓
 *
 * E o mesmo 7.80 reaparece como sizing de `Bet 7.8 (25%)` no river, sobre um
 * pote diferente — coincidência de valor, não de ramo.
 *
 * A CONTAGEM DE COMBOS FECHA O CIRCUITO POR OUTRO CAMINHO. No par 3 o IP paga
 * o turn com 188.36 combos; no par 4 o painel do GTO Wizard exibe o range do
 * BTN em 188.3 combos. São nós distintos da mesma árvore, e o número atravessa.
 *
 * Isto NÃO é calibração e não vira reprodutibilidade: continua sendo
 * transcrição de captura de terceiro. O que estabelece é que a Etapa A foi
 * lida corretamente — quatro identidades independentes teriam que falhar
 * juntas para um erro de dígito sobreviver.
 */
export const CADEIA_TURN_RIVER = {
  potTurnBb: 23.43,
  callDoIpBb: 7.8,
  potRiverBb: 31.23,
  stackIpNoTurnBb: 35,
  stackNoRiverBb: 27.2,
  combosDoCallNoTurn: 188.36,
  combosDoRangeIpNoRiver: 188.3,
  nota:
    'O cbet do OOP no turn foi 7.80 = 50% dos 15.63 de pote anteriores; o pote ' +
    '23.43 do par 3 já o inclui, que é como o GTO Wizard exibe pote diante de aposta.',
} as const;

/**
 * Painel superior direito da captura do par 4 (`image80.png`), lado ChipEV.
 *
 * O CONTRATO NÃO MODELA EV, e este objeto não o reintroduz pela porta dos
 * fundos: ele existe porque encerra, com prova interna, a dúvida do glifo.
 *
 * Cada um dos oito campos vem precedido de uma marca curta. A dupla leitura
 * cega registrou a marca sem decidir se era menos ou triângulo — o Leitor 2
 * declarou explicitamente não distinguir na resolução disponível. Não é
 * preciso distinguir:
 *
 *   equidade do BB + equidade do BTN = 51.26 + 48.74 = 100.00
 *
 * Duas equidades complementares não podem ser ambas negativas, e combos
 * tampouco: 27.8 do BB reaparece como a soma das ações (18.39 + 0.05 + 9.38 =
 * 27.82). A marca é INDICADOR DE DIREÇÃO, e agora está provado por um mecanismo
 * interno diferente do que a Etapa A usou.
 *
 * Por isso os valores abaixo ficam SEM SINAL: o sinal nunca foi lido.
 */
export const PAINEL_CHIPEV_RIVER = {
  bbOop: { ev: 18.33, equidadePct: 51.26, eqrPct: 114, combos: 27.8 },
  btnIp: { ev: 12.9, equidadePct: 48.74, eqrPct: 85, combos: 188.3 },
  somaDasEquidadesPct: 100.0,
  glifo:
    'indicador de direção do widget, não sinal aritmético — provado pela ' +
    'complementaridade das equidades e pela positividade dos combos',
} as const;

/**
 * ATRIBUIÇÃO AMBÍGUA — o documento reusa capturas entre passes de nodelock.
 *
 * Os pares 5 e 6 usam capturas do lado ChipEV que aparecem DUAS vezes no
 * documento, com legendas de nós diferentes:
 *
 *   image55.png -> no 14 `IP reaction vs XR - after cbet small flop`
 *               -> (sem numero) `Range de defesa IP vs BB xR`
 *   image45.png -> no 15 `BB XR and betting turn after IP calls (2d)`
 *               -> no 21 `Action BB turn after IP calls no XR (2d)`
 *
 * Nos dois casos a segunda inserção cai num BLOCO DE NODELOCK DIFERENTE. Se os
 * passes 12-18, 19-23 e 24-27 produzem solves distintos, no máximo uma das duas
 * legendas está correta para cada captura — e o documento não diz qual.
 *
 * ISSO NÃO É SUSPEITA GENÉRICA: há prova. `image63.png` aparece três vezes,
 * legendada `12 Nodelock: IP Action após BB Check`, `19 Nodelock: Obrigando o
 * IP a cbetar sizing baixa` e `24 Nodelock: Obrigando o OOP a cbetar sizing
 * baixa`. A captura mostra o **BTN apostando 1.1 a 100%** — ela não pode
 * ilustrar um lock sobre o OOP. A terceira legenda está errada, e isso
 * estabelece que a atribuição de figura é falível nesta região.
 *
 * POR QUE OS PARES 5 E 6 ENTRAM MESMO ASSIM, e o par com `image7.png` não:
 * `image7.png` tem quatro inserções que descrevem OBJETOS DIFERENTES (`range
 * de ataque` contra `range de defesa`), então nem o spot é recuperável. Aqui as
 * duas legendas de cada captura descrevem o MESMO spot em fraseados diferentes,
 * e a cadeia aritmética de `CADEIA_FLOP_TURN_RIVER` amarra as duas capturas ao
 * mesmo solve. O que fica em aberto é a QUAL PASSE DE NODELOCK elas pertencem.
 *
 * Só o autor da fonte pode fechar isso. Até lá, `nodeLabel` nomeia as duas
 * inserções e este objeto declara a ambiguidade em vez de escondê-la.
 */
export const ATRIBUICAO_AMBIGUA_NODELOCK = {
  afetaPares: [
    'PAR_5_IP_VS_XR_FLOP',
    'PAR_6_BB_TURN_APOS_CALL',
    'PAR_7_BB_VS_CBET_SMALL',
  ] as const,
  capturas: {
    'image7.png': [
      '13 BB X-R vs IP cbet size small',
      '16 Range de ataque OOP vs IP cbet small',
      '20 Range de defesa OOP vs IP cbet small',
      '25 Range de defesa OOP vs IP cbet small',
    ],
    'image55.png': [
      '14 IP reaction vs XR - after cbet small flop',
      'Range de defesa IP vs BB xR',
    ],
    'image45.png': [
      '15 BB XR and betting turn after IP calls (2d)',
      '21 Action BB turn after IP calls no XR (2d)',
    ],
  },
  provaDeQueAAtribuicaoEFalivel:
    'image63.png tem 3 insercoes; a terceira a legenda como lock sobre o OOP, ' +
    'mas a captura mostra o BTN (IP) apostando 1.1 a 100%. Legenda incompativel ' +
    'com o conteudo.',
  pendenteDeArbitragem: true,
} as const;

/**
 * O NODELOCK que torna os pares 5 e 6 interpretáveis — `image63.png`.
 *
 * Captura de UM LADO SÓ (ChipEV); não há gêmeo ICMev, então não é par. Entra
 * como contexto porque explica um número que, sem ele, pareceria defeito: o
 * range do IP no par 5 tem 370.9 combos, que é o range INTEIRO. Isso só faz
 * sentido porque o lock obriga o IP a apostar 1.1 com 100% da mão.
 *
 * Os 370.9 aparecem em três capturas distintas — aqui, no par 2 e no par 5 —,
 * e o par 6 exibe o range do BTN em 252, que é o `totalCombos` do par 3.
 *
 * UM TERCEIRO VALOR PARA O TOTAL DO BB. O cabeçalho deste arquivo registra que
 * o mesmo spot aparece com 752.8 e 752.6 em capturas diferentes. Esta traz
 * **752.7**. Três valores para a mesma grandeza, todos da fonte: reforça que a
 * divergência é de exibição do solver, não de leitura. Não se escolhe um, não
 * se tira média.
 */
export const NODELOCK_IP_CBET_SMALL = {
  captura: 'image63.png',
  legendas: [
    '12 Nodelock: IP Action após BB Check',
    '19 Nodelock: Obrigando o IP a cbetar sizing baixa',
    '24 Nodelock: Obrigando o OOP a cbetar sizing baixa (LEGENDA INCOMPATÍVEL)',
  ],
  potBb: 5.63,
  stacksBb: { BTN: 40, BB: 40 },
  acoes: {
    bet: { label: 'Bet 1.1 (20%)', sizingBb: 1.1, frequencyPct: 100, combos: 370.9 },
    check: { label: 'Check', frequencyPct: 0, combos: 0.04 },
  },
  combosDoBb: 752.7,
  equidadePct: { bb: 35.2, btn: 64.8 },
} as const;

/**
 * PAR 5 — o IP reage ao check-raise do BB no flop.
 *
 * ChipEV: figura 20 (`image55.png`), nó 14.
 * ICMev:  figura 49 (`image54.png`), nó 43.
 *
 * O documento marca os dois com `compare with`: é pareamento do próprio autor,
 * não inferência minha.
 *
 * PRIMEIRO PAR EM QUE AS CLASSES DE AÇÃO CORRESPONDEM E OS SIZINGS NÃO —
 * mesma forma do par 3, e por isso mesmo um segundo caso do padrão em vez de
 * uma ocorrência isolada. Os dois lados oferecem fold, call e dois raises;
 * `Allin 40` continua sendo `raise` porque aqui há aposta pendente e não se
 * pode pedir mesa. O sinalizador é `SIZING_CORRESPONDENCE_UNVERIFIABLE`.
 *
 * UMA OBSERVAÇÃO QUE **NÃO** É EXPLICAÇÃO, e que precisa de arbitragem:
 * o all-in do ChipEV é rotulado `Allin 40` e o do ICMev `raises 37.88bb`. O
 * 37.88 é exatamente `MESA_COMPLETA_NO_OPEN.efetivaPosFlopBb`, já registrado.
 * A correspondência é factual e verificável. O que ela **não** autoriza é
 * ressuscitar a explicação causal descartada pelo Tier 0 ("os motores partem de
 * stacks efetivas diferentes"): a stack efetiva é 40bb nos dois cenários antes
 * do open, e essa correção continua valendo. Registra-se a coincidência
 * numérica como HIPÓTESE NÃO CONFIRMADA, em `HIPOTESE_BASE_DO_ALLIN`, e a
 * causa da divergência de sizing segue declarada como NÃO DETERMINADA.
 */
export const PAR_5_IP_VS_XR_FLOP: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 19, // 0-based; 20ª inserção
    nodeLabel:
      '14 IP reaction vs XR after cbet small flop / 43 IP reaction vs XR ' +
      '(ATRIBUIÇÃO AMBÍGUA: image55.png também legendada `Range de defesa IP vs BB xR`)',
  },
  context: {
    street: 'flop',
    board: read('Kd Jc Ts'),
    potBb: read(11.73),
    players: [
      { id: 'BB', position: 'OOP', stackBb: read(35) },
      { id: 'BTN', position: 'IP', stackBb: read(38.9) },
    ],
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    totalCombos: read(370.9),
    actions: [
      { label: 'Fold', frequencyPct: read(30.5), combos: read(113.13) },
      { label: 'Call', frequencyPct: read(68.2), combos: read(252.95) },
      {
        label: 'Raise 12.8 (50%)',
        sizingBb: read(12.8),
        frequencyPct: read(1.3),
        combos: read(4.82),
      },
      {
        label: 'Allin 40 (224%)',
        sizingBb: read(40),
        frequencyPct: read(0),
        combos: read(0.01),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      { label: 'folds', frequencyPct: read(36.0), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      { label: 'calls', frequencyPct: read(63.9), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      {
        label: 'raises 15.09bb',
        sizingBb: read(15.09),
        frequencyPct: read(0.1),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'raises 37.88bb',
        sizingBb: read(37.88),
        frequencyPct: read(0.0),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * PAR 6 — o BB age no turn, depois que o IP paga o check-raise.
 *
 * ChipEV: figura 21 (`image45.png`), nó 15.
 * ICMev:  figura 50 (`image28.png`), nó 44.
 *
 * Também pareado por `compare with` no documento.
 *
 * QUARTA OCORRÊNCIA DA SOMA 100.1%, e a segunda no GTO Wizard pós-flop:
 * 23.8 + 18.9 + 57.4. Não normalizar.
 *
 * Mesma forma do par 4: `Allin 35` normaliza para `bet` porque o cenário
 * oferece `check`, e a divergência que resta é de CARDINALIDADE — duas sizings
 * de aposta contra três.
 *
 * O `bets 32.81bb` do lado ICMev é o MESMO número que o par 3 registra como
 * `raises 32.81bb`, também no turn. Duas capturas independentes do HRC, mesmo
 * valor de shove na mesma street.
 */
export const PAR_6_BB_TURN_APOS_CALL: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 20, // 0-based; 21ª inserção
    nodeLabel:
      '15 BB XR and betting turn after IP calls (2d) / 44 idem ' +
      '(ATRIBUIÇÃO AMBÍGUA: image45.png também legendada `21 Action BB turn after IP calls no XR (2d)`)',
  },
  context: {
    street: 'turn',
    board: read('Kd Jc Ts 2d'),
    potBb: read(15.63),
    players: [
      { id: 'BB', position: 'OOP', stackBb: read(35) },
      { id: 'BTN', position: 'IP', stackBb: read(35) },
    ],
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    totalCombos: read(49.5),
    actions: [
      { label: 'Check', frequencyPct: read(57.4), combos: read(28.38) },
      {
        label: 'Bet 3.9 (25%)',
        sizingBb: read(3.9),
        frequencyPct: read(18.9),
        combos: read(9.33),
      },
      {
        label: 'Allin 35 (224%)',
        sizingBb: read(35),
        frequencyPct: read(23.8),
        combos: read(11.76),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      { label: 'folds', frequencyPct: read(0.0), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      { label: 'checks', frequencyPct: read(42.0), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      {
        label: 'bets 3.15bb',
        sizingBb: read(3.15),
        frequencyPct: read(11.0),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 7.88bb',
        sizingBb: read(7.88),
        frequencyPct: read(42.8),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'bets 32.81bb',
        sizingBb: read(32.81),
        frequencyPct: read(4.2),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * PAR 7 — o BB reage à cbet pequena do IP no flop.
 *
 * ChipEV: figura 19 (`image7.png`), nó 13.
 * ICMev:  figura 48 (`image12.png`), nó 42.
 *
 * ═══ CORREÇÃO DE UMA REJEIÇÃO MINHA, NÃO DO TIER 0 ═══
 *
 * A Etapa A rejeitou este par, e a Etapa C repetiu a rejeição. O motivo dado
 * foi que `image7.png` aparece em quatro inserções cujas legendas descreveriam
 * OBJETOS DIFERENTES — "range de ataque" contra "range de defesa" —, de modo
 * que nem o spot seria recuperável.
 *
 * **O motivo era falso, e o conteúdo da captura o desmente.** `image7.png`
 * mostra um único nó: o BB diante da cbet de 1.1 do IP, pote 6.73, stacks
 * BTN 38.9 e BB 40, com Fold / Call / Raise 5 (50%) / Allin 40 (497%). As
 * quatro legendas são QUATRO VISTAS DA MESMA TELA — "ataque" é o ramo de raise
 * (6.8%), "defesa" é call mais raise (57.4% + 6.8%). Não são nós distintos.
 *
 * O segundo leitor, sem contexto, chegou à mesma conclusão por conta própria e
 * pelo argumento mais forte: o rótulo `Allin 40` casa com o badge do BB (40) e
 * NÃO com o do BTN (38.9), logo o painel é do BB.
 *
 * O erro foi contar inserções em vez de ler a captura. A ambiguidade REAL de
 * `image7.png` é a mesma dos pares 5 e 6 — a qual passe de nodelock pertence —,
 * e essa fica declarada em `ATRIBUICAO_AMBIGUA_NODELOCK`, não elimina o par.
 *
 * ═══ O QUE O PAR TRAZ ═══
 *
 * As classes correspondem dos dois lados (fold, call, dois raises) e os sizings
 * não. O caso é instrutivo porque UM DELES QUASE CORRESPONDE: `Raise 5` contra
 * `raises 5.06bb` diverge 0.06, contra uma folga de 0.0506. Reprova por 0.0094.
 *
 * NÃO ALARGAR A TOLERÂNCIA PARA ACOMODAR. A folga é `max(0.05 absoluto, 1%
 * relativo)`, declarada antes de existir este par. Mexer nela agora seria
 * ajustar o instrumento ao resultado — a mesma falha que a Etapa B recusou
 * quando um teste sintético quebrou.
 *
 * A soma das frequências do ChipEV é **99.9%** — 0 + 6.8 + 57.4 + 35.7. É a
 * primeira ocorrência ABAIXO de 100 em sete pares; as anteriores eram 100.0 ou
 * 100.1. Confirma que o arredondamento de exibição da fonte desvia para os dois
 * lados, e que uma tolerância simétrica era a escolha certa.
 */
export const PAR_7_BB_VS_CBET_SMALL: EvidencePair = {
  source: {
    documentSha256: AULA_1_2_SHA256,
    figureIndex: 18, // 0-based; 19ª inserção
    nodeLabel:
      '13 BB X-R vs IP cbet size small / 42 idem ' +
      '(ATRIBUIÇÃO AMBÍGUA: image7.png tem 4 inserções; todas do MESMO nó, ' +
      'mas em blocos de nodelock possivelmente distintos)',
  },
  context: {
    street: 'flop',
    board: read('Kd Jc Ts'),
    potBb: read(6.73),
    players: [
      { id: 'BB', position: 'OOP', stackBb: read(40) },
      { id: 'BTN', position: 'IP', stackBb: read(38.9) },
    ],
  },
  chipEv: {
    regime: 'chipEV',
    solver: 'GTO Wizard',
    totalCombos: read(752.7),
    actions: [
      { label: 'Fold', frequencyPct: read(35.7), combos: read(268.83) },
      { label: 'Call', frequencyPct: read(57.4), combos: read(432.38) },
      {
        label: 'Raise 5 (50%)',
        sizingBb: read(5),
        frequencyPct: read(6.8),
        combos: read(51.52),
      },
      {
        label: 'Allin 40 (497%)',
        sizingBb: read(40),
        frequencyPct: read(0),
        combos: read(0),
      },
    ],
  },
  icmEv: {
    regime: 'icmEV',
    solver: 'HRC',
    totalCombos: unreadable(HRC_RECORTE_SEM_COMBOS),
    actions: [
      { label: 'folds', frequencyPct: read(42.6), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      { label: 'calls', frequencyPct: read(48.1), combos: unreadable(HRC_RECORTE_SEM_COMBOS) },
      {
        label: 'raises 5.06bb',
        sizingBb: read(5.06),
        frequencyPct: read(9.3),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
      {
        label: 'raises 37.88bb',
        sizingBb: read(37.88),
        frequencyPct: read(0.0),
        combos: unreadable(HRC_RECORTE_SEM_COMBOS),
      },
    ],
  },
};

/**
 * O QUASE-ENCONTRO DE SIZING DO PAR 7, medido.
 *
 * Existe para que a decisão de NÃO alargar a tolerância fique auditável, e para
 * que o próximo leitor veja de quanto foi. Se alguém um dia afrouxar a folga,
 * o teste que consome este objeto denuncia o motivo real da mudança.
 */
export const QUASE_ENCONTRO_DE_SIZING_PAR_7 = {
  chipEvBb: 5,
  icmEvBb: 5.06,
  diferenca: 0.06,
  folgaVigente: 0.0506,
  reprovaPor: 0.0094,
  decisao: 'manter a tolerancia; ajustar o instrumento ao resultado e o defeito que a Etapa B recusou',
} as const;

/**
 * HIPÓTESE NÃO CONFIRMADA — a base de que cada motor calcula o all-in.
 *
 * ESTE OBJETO NÃO É EVIDÊNCIA E NÃO EXPLICA NADA. Ele existe para que uma
 * observação numérica fique registrada SEM virar causa por repetição.
 *
 * O observado, e é só isto:
 *   ChipEV rotula o all-in do flop `Allin 40`; 40 é a stack de referência que
 *   o GTO Wizard exibe nos badges no flop (`NODELOCK_IP_CBET_SMALL.stacksBb`).
 *   ICMev rotula o mesmo ramo `raises 37.88bb`; 37.88 é
 *   `MESA_COMPLETA_NO_OPEN.efetivaPosFlopBb`.
 *
 * Por que isso NÃO fecha a questão: o Tier 0 descartou explicitamente a
 * explicação "os motores partem de stacks efetivas diferentes" quando ela foi
 * usada para o par 3, e essa correção continua valendo — a efetiva é 40bb nos
 * dois cenários ANTES DO OPEN. A coincidência aqui é sobre a base PÓS-FLOP que
 * cada interface exibe, que é outra grandeza. Confundir as duas foi o erro
 * original, e repeti-lo com número novo continuaria sendo erro.
 *
 * FALSIFICADOR: se uma recaptura do HRC mostrar a stack pós-flop diferente de
 * 37.88, ou o GTO Wizard exibir base diferente de 40 nesta árvore, a hipótese
 * cai. Enquanto não houver recaptura, a causa da divergência de sizing entre os
 * dois motores permanece **NÃO DETERMINADA**.
 */
export const HIPOTESE_BASE_DO_ALLIN = {
  confirmada: false,
  chipEvAllinBb: 40,
  icmEvAllinBb: 37.88,
  observacao:
    'Cada motor rotula o all-in pelo total da sua propria base; as bases sao ' +
    '40 (badges do GTO Wizard no flop) e 37.88 (efetiva pos-flop do Table Draw).',
  naoConfundirCom:
    'a explicacao de stacks efetivas distintas por regime, DESCARTADA pelo ' +
    'Tier 0: a efetiva e 40bb nos dois cenarios antes do open.',
  falsificador:
    'recaptura do HRC mostrando stack pos-flop diferente de 37.88, ou GTO ' +
    'Wizard exibindo base diferente de 40 nesta arvore.',
  causaDaDivergenciaDeSizing: 'NAO DETERMINADA',
} as const;

/**
 * A TRILHA DO GTO WIZARD — `image59.png`, nó 17. Uma captura que verifica quatro.
 *
 * Diferente de todas as outras, esta inclui a BARRA DE NAVEGAÇÃO do solver: a
 * árvore inteira, coluna por coluna, do flop até o nó atual. Cada coluna traz o
 * jogador da vez, a stack, e TODAS as ações disponíveis naquele ponto.
 *
 * O efeito é que ela confere, de uma vez e por fonte independente, os conjuntos
 * de ação de quatro capturas transcritas separadamente:
 *
 *   BB 40    Check | Bet 1.4 (25%)                              -> par 1
 *   BTN 40   Check | Bet 1.1 (20%)                              -> nodelock
 *   BB 40    Fold | Call | Raise 5 (50%) | Allin 40 (497%)      -> par 7
 *   BTN 38.9 Fold | Call | Raise 12.8 (50%) | Allin 40 (224%)   -> par 5
 *   TURN 15.63 (2♦), BB 35, BTN 35                              -> par 6
 *
 * Os rótulos batem dígito a dígito com o que cada captura mostra isoladamente,
 * inclusive os sizings e os percentuais entre parênteses.
 *
 * ELA TAMBÉM CONVERTE UM PASSO INFERIDO EM PASSO LIDO. A cadeia da Etapa C
 * precisava calcular `15.63 x 50% = 7.815 ~ 7.80` para ligar o par 6 ao par 3.
 * Aqui o ramo `Bet 7.8 (50%)` está na tela, e o painel mede sua frequência em
 * 57.6% com 28.48 combos. A ligação deixou de ser aritmética minha.
 *
 * E EXPÕE O QUE OS BLOCOS DE NODELOCK FAZEM. Este nó do turn tem exatamente o
 * mesmo pote (15.63), as mesmas stacks (35/35), as mesmas equidades
 * (48.63/51.37) e os mesmos combos (49.5 e 252) que o par 6 — mas um MENU DE
 * SIZINGS DIFERENTE: aqui `Check | Bet 7.8 (50%)`, lá `Check | Bet 3.9 (25%) |
 * Allin 35 (224%)`. É o mesmo nó resolvido sob locks distintos, e é a
 * demonstração concreta do que `ATRIBUICAO_AMBIGUA_NODELOCK` adverte.
 *
 * Não é par: não há gêmeo ICMev para o nó 17.
 */
export const TRILHA_GTO_WIZARD = {
  captura: 'image59.png',
  legenda: '17 Action BB turn after IP calls no XR (2d)',
  cabecalho: { stackBb: 40, potBb: 5.63, rotulo: 'BB vs. BTN' },
  colunas: [
    { street: 'FLOP', potBb: 5.63, cartas: 'K♦ J♣ T♠' },
    { jogador: 'BB', stackBb: 40, acoes: [ 'Check', 'Bet 1.4 (25%)' ], confirma: 'PAR_1_BB_LEADING' },
    { jogador: 'BTN', stackBb: 40, acoes: [ 'Check', 'Bet 1.1 (20%)' ], confirma: 'NODELOCK_IP_CBET_SMALL' },
    {
      jogador: 'BB',
      stackBb: 40,
      acoes: [ 'Fold', 'Call', 'Raise 5 (50%)', 'Allin 40 (497%)' ],
      confirma: 'PAR_7_BB_VS_CBET_SMALL',
    },
    {
      jogador: 'BTN',
      stackBb: 38.9,
      acoes: [ 'Fold', 'Call', 'Raise 12.8 (50%)', 'Allin 40 (224%)' ],
      confirma: 'PAR_5_IP_VS_XR_FLOP',
    },
    { street: 'TURN', potBb: 15.63, cartas: '2♦' },
    { jogador: 'BB', stackBb: 35, acoes: [ 'Check', 'Bet 7.8 (50%)' ] },
    {
      jogador: 'BTN',
      stackBb: 35,
      acoes: [ 'Check', 'Bet 3.1 (20%)', 'Bet 7.8 (50%)', 'Bet 11.7 (75%)', 'Allin 35 (224%)' ],
    },
  ],
  noAtual: {
    potBb: 15.63,
    stacksBb: 35,
    acoes: [
      { label: 'Bet 7.8 (50%)', frequencyPct: 57.6, combos: 28.48 },
      { label: 'Check', frequencyPct: 42.4, combos: 21 },
    ],
    painel: {
      bbOop: { ev: 8.76, equidadePct: 48.63, eqrPct: 115, combos: 49.5 },
      btnIp: { ev: 6.87, equidadePct: 51.37, eqrPct: 86, combos: 252 },
    },
  },
  mesmoNoQueOPar6ComMenuDiferente: true,
} as const;

/**
 * O GLIFO, ENCERRADO POR OBSERVAÇÃO DIRETA.
 *
 * Desde a Etapa A este arquivo afirma que a marca antes dos campos do painel é
 * indicador de direção e não sinal negativo. A prova era sempre INDIRETA:
 * equidade não pode ser negativa; equidades complementares somam 100; combos
 * não podem ser negativos. Bons argumentos, mas todos aritméticos.
 *
 * `image59.png` está em resolução maior, e o segundo leitor — perguntado campo a
 * campo, sem saber o que se esperava — respondeu que os oito símbolos **NÃO são
 * iguais entre si**: quatro apontam para cima em verde, quatro para baixo em
 * vermelho. Um sinal de menos não aponta para cima.
 *
 * E as direções são ANTI-CORRELACIONADAS entre os dois jogadores, campo a
 * campo: onde o BB sobe, o BTN desce. É o comportamento de um comparador entre
 * as duas mãos, não de um sinal aritmético.
 *
 * HONESTIDADE SOBRE A CONFIANÇA: o leitor declarou confiança ALTA em seis dos
 * oito e MÉDIA em dois (os campos `Combos`, cujo glifo é menor). A afirmação
 * que este objeto sustenta é a NÃO-UNIFORMIDADE e as CORES, ambas declaradas
 * com segurança — e a não-uniformidade sozinha já basta.
 */
export const GLIFO_DE_DIRECAO = {
  provaDireta: 'image59.png',
  simbolosUniformes: false,
  direcoes: {
    bbOop: { ev: 'cima', equidade: 'baixo', eqr: 'cima', combos: 'baixo' },
    btnIp: { ev: 'baixo', equidade: 'cima', eqr: 'baixo', combos: 'cima' },
  },
  antiCorrelacionadoEntreJogadores: true,
  confiancaDeclaradaPeloLeitor: { alta: 6, media: 2 },
  conclusao:
    'indicador de direcao do widget; um sinal de menos nao aponta para cima, e ' +
    'as oito marcas nao sao iguais entre si',
} as const;

/**
 * A LINHA COMPLETA, do flop ao river, e o que ela fecha.
 *
 * Os pares 5, 6, 3 e 4 são nós consecutivos, transcritos de quatro capturas
 * diferentes sem que a leitura de uma informasse a outra. Encaixados, fecham
 * identidades que nenhuma captura contém sozinha:
 *
 *   FLOP  -> TURN
 *     pote  11.73 + call 3.90            = 15.63   (par 5 -> par 6)
 *     BTN   38.90 - call 3.90            = 35.00   = stack no par 6
 *
 *   TURN (nodelock de 50%) -> TURN diante da aposta
 *     15.63 x 50%                        = 7.815 ~ 7.80
 *     pote  15.63 + 7.80                 = 23.43   = pote do par 3
 *     BB    35.00 - 7.80                 = 27.20   = stack do BB no par 3
 *
 *   TURN -> RIVER
 *     pote  23.43 + call 7.80            = 31.23   = pote do par 4
 *     BTN   35.00 - call 7.80            = 27.20   = stack no par 4
 *
 * E as contagens de combos atravessam os nós por outro caminho: 370.9 é o range
 * do IP no nodelock, no par 2 e no par 5; 252 é o range do BTN no par 6 e o
 * `totalCombos` do par 3.
 *
 * ISTO NÃO É REPRODUTIBILIDADE e não autoriza calibração — continua sendo
 * transcrição de captura de terceiro. O que estabelece é consistência interna:
 * um erro de dígito em qualquer um dos quatro pares quebraria pelo menos uma
 * destas igualdades.
 */
export const CADEIA_FLOP_TURN_RIVER = {
  flop: { potBb: 11.73, stackBtnBb: 38.9, callDoIpBb: 3.9 },
  turn: { potBb: 15.63, stacksBb: 35, cbetDe50PctBb: 7.8 },
  turnDianteDaAposta: { potBb: 23.43, stackBbBb: 27.2, callDoIpBb: 7.8 },
  river: { potBb: 31.23, stacksBb: 27.2 },
  flopDianteDaCbet: { potBb: 6.73, stackBbBb: 40, raiseDoBbBb: 5 },
  rangeDoIp: 370.9,
  rangeDoBbNoFlop: 752.7,
  rangeDoBtnNoTurn: 252,
  shoveDoHrcNoTurnBb: 32.81,
} as const;

/**
 * ESCOPO DO PRIMEIRO CORTE, por decisão do Tier 0.
 *
 * O objeto é o PÓS-FLOP APÓS O CALL DO BB: BTN abre min-raise, SB folda, BB
 * paga, e a mão segue heads-up a partir do flop. Os três pares transcritos
 * estão todos dentro desse recorte.
 *
 * O SB fica FORA por ora. Ele aparece no Table Draw e posta 0.50bb — o que o
 * mantém no cálculo do pote e no conjunto de assentos que alimenta o ICM do
 * HRC —, mas não é sujeito de nenhum nó comparado, e nenhuma análise deve
 * partir dele neste corte.
 *
 * Isto é delimitação deliberada, não omissão: registrada para que ninguém a
 * confunda com esquecimento e vá "completar" o SB depois.
 */
export const ESCOPO_PRIMEIRO_CORTE = {
  objeto: 'pós-flop heads-up após o call do BB',
  linhaPreflop: 'BTN abre min-raise 2.00bb; SB folda; BB paga',
  sbNoEscopo: false,
  sbPorQueApareceAindaAssim:
    'posta 0.50bb (entra no pote) e é um dos nove assentos do ICM no HRC',
} as const;

/** Os pares transcritos, na ordem em que aparecem no documento. */
export const AULA_1_2_PAIRS: readonly EvidencePair[] = [
  PAR_1_BB_LEADING,
  PAR_2_IP_APOS_CHECK,
  PAR_7_BB_VS_CBET_SMALL,
  PAR_5_IP_VS_XR_FLOP,
  PAR_6_BB_TURN_APOS_CALL,
  PAR_3_IP_VS_CBET_TURN,
  PAR_4_OOP_RIVER,
];

/**
 * Stacks declarados NO TEXTO do documento, que divergem do exibido nas
 * capturas do GTO Wizard (40/40 efetivo). Preservados para que a divergência
 * fique auditável em vez de desaparecer.
 */
export const STACKS_DECLARADOS_NO_TEXTO = {
  btnBb: 38,
  bbBb: 53,
  nota:
    'GTO Wizard usa stack efetiva entre os dois ativos; HRC considera ambas as ' +
    'stacks e as dos jogadores que desistiram. As capturas exibem 40/40.',
} as const;

/** Risk Premium declarado no texto para o spot-âncora. */
export const RISK_PREMIUM_DECLARADO = {
  btnPct: 21.4,
  bbPct: 12.9,
  diferencaPp: 8.5,
} as const;
