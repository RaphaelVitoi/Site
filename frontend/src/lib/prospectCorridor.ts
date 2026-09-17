/**
 * IDENTITY: Motor Estocástico de Corredor Prospectivo e Âncoras Canônicas (SOTA v8.0 GOLD)
 * PATH: src/lib/prospectCorridor.ts
 * ROLE: Modela a tendência central (mu) e bandas de desvio-padrão (+- 1sigma, +- 2sigma)
 *       atreladas ao Fator Psi (entropia/relógio), Realização de Equidade (R) e Utilidade S-Shape.
 *
 * @format
 */

export interface CanonicalAnchor {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  badgeTheme: 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan';
  criterioLogico: string;
  diretrizEstrategica: string;
  teoremaRef: string;
  defaults: {
    psiFactor: number;
    realizationFactor: number;
    lossAversionLambda: number;
    numPlayers: number;
    isNearPayjump: boolean;
    blindsRising: boolean;
    sprEstimate: number;
    position: 'IP' | 'OOP';
    potOdds: number;
  };
}

export const CANONICAL_ANCHORS: readonly CanonicalAnchor[] = [
  {
    id: 'ft_bubble',
    name: '1. Bolha ICM Crítica',
    subtitle: 'Final Table / Payjump Iminente',
    tag: 'Sobrevivência',
    badgeTheme: 'rose',
    criterioLogico:
      'Payjump ativo com micro-stacks em risco; aversão extrema à ruína (λ = 3.0, BF ≥ 1.8). Pressão do relógio inflaciona Ψ para 1.25x.',
    diretrizEstrategica:
      'Sobrevivência é o pré-requisito ontológico de utilidade futura (U(0) → -∞). A banda inferior (-2σ) entra em colapso profundo: overfold sistemático fora do topo.',
    teoremaRef: 'Teorema 2 & Parábola da Ruína Assimétrica (99% vs 1%)',
    defaults: {
      psiFactor: 1.25,
      realizationFactor: 0.85,
      lossAversionLambda: 3.0,
      numPlayers: 2,
      isNearPayjump: true,
      blindsRising: false,
      sprEstimate: 1.5,
      position: 'OOP',
      potOdds: 0.38,
    },
  },
  {
    id: 'convex_leverage_ip',
    name: '2. Alavancagem Convexa IP',
    subtitle: 'Deep Stack & Opções Baratas',
    tag: 'Expansão',
    badgeTheme: 'emerald',
    criterioLogico:
      'SPR ≥ 6.0, Hero em posição (IP), estrutura lenta com tempo até o salto de blinds. Ψ = 0.80x (tempo e edge favoráveis).',
    diretrizEstrategica:
      'Vantagem fractal posicional. Hero realiza mais equidade do que a crua (R = 1.25x) e compra opções baratas com alto payoff contra o líder da mesa.',
    teoremaRef: 'Teorema 4 & Teorema 6 (Alavancagem Convexa vs Chip Leader)',
    defaults: {
      psiFactor: 0.8,
      realizationFactor: 1.25,
      lossAversionLambda: 2.25,
      numPlayers: 2,
      isNearPayjump: false,
      blindsRising: false,
      sprEstimate: 7.0,
      position: 'IP',
      potOdds: 0.30,
    },
  },
  {
    id: 'multiway_hydra',
    name: '3. Colapso Multiway Hidra',
    subtitle: 'Dispersão Entrópica (N ≥ 3)',
    tag: 'Atrito RIO',
    badgeTheme: 'amber',
    criterioLogico:
      'N ≥ 3 participantes no pote; Passivo RIO cresce proporcionalmente a (N-1)². Mãos coordenadas de Omaha sobrepostas em disputa.',
    diretrizEstrategica:
      'Colapso brutal da taxa de realização (R = 0.65x). A dispersão estocástica (σ) duplica: decisões aparentadas como positivas sofrem alto risco de ruína invisível.',
    teoremaRef: 'Teorema 7 (A Dispersão Entrópica Multiway & A Hidra de Omaha)',
    defaults: {
      psiFactor: 1.2,
      realizationFactor: 0.65,
      lossAversionLambda: 2.25,
      numPlayers: 3,
      isNearPayjump: false,
      blindsRising: false,
      sprEstimate: 3.0,
      position: 'OOP',
      potOdds: 0.25,
    },
  },
  {
    id: 'orbital_inertia_fold',
    name: '4. Inércia Orbital & Fold',
    subtitle: 'Laddering & Baseline Dinâmico',
    tag: 'Piso Positivo',
    badgeTheme: 'indigo',
    criterioLogico:
      'Hero próximo do BB (≤ 2 órbitas), presença de predadores ativos e micro-stacks. Salto de blinds iminente (Ψ = 1.35x).',
    diretrizEstrategica:
      'O Fold gera valor estocástico positivo (EV_fold > 0) pela colisão inevitável de terceiros. Ação voluntária só se sustenta se a margem μ - σ superar o ganho passivo de sobrevivência.',
    teoremaRef: 'Teorema 1 (O Axioma do Baseline Dinâmico EV_fold ≠ 0)',
    defaults: {
      psiFactor: 1.35,
      realizationFactor: 0.9,
      lossAversionLambda: 2.5,
      numPlayers: 2,
      isNearPayjump: true,
      blindsRising: true,
      sprEstimate: 2.0,
      position: 'OOP',
      potOdds: 0.33,
    },
  },
  {
    id: 'river_bluffcatcher',
    name: '5. River Bluffcatcher',
    subtitle: 'Inversão de Valuation (Teorema 2)',
    tag: 'RP Negativo',
    badgeTheme: 'cyan',
    criterioLogico:
      'Pote concentrado (≥ 30 BB), stack residual irrelevante (≤ 5 BB), SPR ≤ 0.20; Bubble Factor < 1.0 acarretando Risk Premium negativo.',
    diretrizEstrategica:
      'A massa de energia foi integralmente transferida para o pote. Não há ruas futuras (R = 1.0, σ → 0). Call mandatória com equidade mesmo substancialmente abaixo do normal.',
    teoremaRef: 'Teorema 2 (A Inversão de Valuation e o Risk Premium Negativo)',
    defaults: {
      psiFactor: 0.9,
      realizationFactor: 1.0,
      lossAversionLambda: 1.5,
      numPlayers: 2,
      isNearPayjump: false,
      blindsRising: false,
      sprEstimate: 0.15,
      position: 'IP',
      potOdds: 0.20,
    },
  },
] as const;

export interface StochasticCorridorInput {
  rawEquity: number; // 0.0 a 1.0
  realizationFactor: number; // Ex: 0.5 a 1.5
  psiFactor: number; // Ex: 0.6 a 1.6
  potOdds?: number; // Ex: 0.33
  spr?: number; // Ex: 1.0 a 10.0
  numPlayers?: number; // Ex: 2 a 5
  lossAversionLambda?: number; // Ex: 1.5 a 3.5 (default: 2.25)
  isNearPayjump?: boolean;
}

export interface StochasticCorridorOutput {
  mu: number; // Tendência central (% de margem de equidade/perspectiva)
  sigma: number; // Desvio-padrão estocástico (%)
  band1sLower: number; // Limite inferior 1σ (68.3% CI)
  band1sUpper: number; // Limite superior 1σ (68.3% CI)
  band2sLower: number; // Limite inferior 2σ (95.4% CI / Worst-Case VaR)
  band2sUpper: number; // Limite superior 2σ (95.4% CI / Upside Máximo)
  solvencyProbability: number; // Probabilidade P(PMev > Baseline) entre 0 e 1
  decisionStatus: 'soberana' | 'marginal' | 'insolvente';
  matchedAnchorId: string;
  effectiveEquityPct: number;
  requiredEquityPct: number;
}

/**
 * Aproximação analítica rápida de Chebyshev / Abramowitz-Stegun para erf(x).
 */
function mathErf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Computa o Corredor Estocástico Prospectivo integrando Ψ, R, Utilidade S-Shape e Variância.
 */
export function calculateStochasticCorridor(
  input: StochasticCorridorInput,
): StochasticCorridorOutput {
  const {
    rawEquity,
    realizationFactor,
    psiFactor,
    potOdds = 0.33,
    spr = 2.0,
    numPlayers = 2,
    lossAversionLambda = 2.25,
    isNearPayjump = false,
  } = input;

  const safeRawEq = Math.min(0.99, Math.max(0.01, rawEquity));
  const safeR = Math.max(0.3, Math.min(1.6, realizationFactor));
  const safePsi = Math.max(0.4, Math.min(2.5, psiFactor));

  // 1. Equidade Efetivamente Realizada
  const effEquity = Math.min(0.99, Math.max(0.01, safeRawEq * safeR));
  const effectiveEquityPct = Number((effEquity * 100).toFixed(1));

  // 2. Bubble Factor Dinâmico sob a lente da Teoria do Prospecto
  const bf = Math.max(0.5, lossAversionLambda);

  // 3. Equidade Requerida de Equilíbrio (Teorema 6 exato dos autos)
  const a = Math.min(0.95, Math.max(0.05, potOdds));
  const exactEq = (bf * a) / (bf * a + 1.0 - a);
  const relPremium = (exactEq - a) / (1.0 - a);
  const reqEq = a + relPremium * safePsi * (1.0 - a);
  const requiredEquityPct = Number((reqEq * 100).toFixed(1));

  // 4. Tendência Central (mu)
  const mu = Number(((effEquity - reqEq) * 100).toFixed(2));

  // 5. Volatilidade e Desvio-Padrão (sigma)
  const volSpr = Math.sqrt(Math.max(0.2, spr / 2.0));
  const volMw = Math.sqrt(Math.max(1, numPlayers - 1));
  const volLambda = Math.sqrt(Math.max(0.5, lossAversionLambda / 2.25));
  const volScale = volSpr * volMw * volLambda * safePsi;

  const baseStd = Math.sqrt(safeRawEq * (1.0 - safeRawEq));
  const sigmaRaw = (baseStd * 32.0 * volScale) / Math.sqrt(8.0);
  const sigma = Number(Math.max(1.5, Math.min(40.0, sigmaRaw)).toFixed(2));

  // 6. Bandas de Confiança
  const band1sLower = Number((mu - sigma).toFixed(2));
  const band1sUpper = Number((mu + sigma).toFixed(2));
  const band2sLower = Number((mu - 2.0 * sigma).toFixed(2));
  const band2sUpper = Number((mu + 2.0 * sigma).toFixed(2));

  // 7. Probabilidade de Solvência
  const z = mu / Math.max(1e-6, sigma);
  const solvencyProbability = Number(
    Math.max(0.0001, Math.min(0.9999, 0.5 * (1.0 + mathErf(z / Math.SQRT2)))).toFixed(4),
  );

  // 8. Classificação de Decisão
  let decisionStatus: 'soberana' | 'marginal' | 'insolvente';
  if (band1sLower > 0) {
    decisionStatus = 'soberana';
  } else if (mu > 0) {
    decisionStatus = 'marginal';
  } else {
    decisionStatus = 'insolvente';
  }

  // 9. Detecção de Correspondência com Âncoras Canônicas
  let matchedAnchorId = 'custom';
  if (numPlayers >= 3) {
    matchedAnchorId = 'multiway_hydra';
  } else if (isNearPayjump || lossAversionLambda >= 2.8) {
    matchedAnchorId = 'ft_bubble';
  } else if (spr >= 5.0 && safeR >= 1.15) {
    matchedAnchorId = 'convex_leverage_ip';
  } else if (spr <= 0.25) {
    matchedAnchorId = 'river_bluffcatcher';
  } else if (safePsi >= 1.3) {
    matchedAnchorId = 'orbital_inertia_fold';
  }

  return {
    mu,
    sigma,
    band1sLower,
    band1sUpper,
    band2sLower,
    band2sUpper,
    solvencyProbability,
    decisionStatus,
    matchedAnchorId,
    effectiveEquityPct,
    requiredEquityPct,
  };
}
