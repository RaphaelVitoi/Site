/** Fonte de verdade para navegação, proveniência e estatuto epistemológico. */

export type EditorialEvidenceLevel =
  | 'observation'
  | 'hypothesis'
  | 'reproducible_experiment'
  | 'externally_replicated'
  | 'scientific_contribution'
  | 'review_required';
export type EditorialKind = 'lesson' | 'theory' | 'laboratory' | 'methodology' | 'manifesto';
export type DidacticStage = 'foundation' | 'icm_baseline' | 'dynamic_hypotheses' | 'laboratory' | 'evidence';

export interface EditorialManifestEntry {
  slug: string;
  href: string;
  title: string;
  summary: string;
  category: string;
  kind: EditorialKind;
  stage: DidacticStage;
  evidenceLevel: EditorialEvidenceLevel;
  contentVersion: string;
  reviewedAt?: string;
  sources: readonly string[];
  methodRef?: string;
  limitations: readonly string[];
  prerequisites?: readonly string[];
  nextSlugs?: readonly string[];
}
export interface EditorialCategory {
  id: string;
  title: string;
  icon: string;
  colorClass: string;
  badgeClass: string;
}

export const LIBRARY_CATEGORIES: readonly EditorialCategory[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    icon: 'fa-book-journal-whills',
    colorClass: 'text-accent-indigo border-accent-indigo/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    badgeClass: 'bg-accent-indigo/15 text-accent-indigo-light border-accent-indigo/30',
  },
  {
    id: 'mecanica',
    title: 'Mecânica & ICM',
    icon: 'fa-gears',
    colorClass: 'text-accent-emerald border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    badgeClass: 'bg-accent-emerald/15 text-accent-emerald-light border-accent-emerald/30',
  },
  {
    id: 'valuation',
    title: 'Valuation & Risco',
    icon: 'fa-scale-unbalanced',
    colorClass: 'text-accent-amber border-accent-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    badgeClass: 'bg-accent-amber/15 text-accent-gold border-accent-amber/30',
  },
  {
    id: 'psicologia',
    title: 'Psicologia & Exploit',
    icon: 'fa-brain',
    colorClass: 'text-accent-rose border-accent-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    badgeClass: 'bg-accent-rose/15 text-accent-rose-light border-accent-rose/30',
  },
  {
    id: 'laboratorios',
    title: 'Laboratórios & Método',
    icon: 'fa-microscope',
    colorClass: 'text-accent-sky border-accent-sky/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    badgeClass: 'bg-accent-sky/15 text-accent-sky border-accent-sky/30',
  },
];

const BASE_LIMITATIONS = [
  'Conceitos autorais e heurísticas dependem de estados, ranges, payouts, rake e árvores de decisão explicitamente declarados.',
  'Nenhum item deve ser interpretado como prescrição universal, calibração de solver ou superioridade empírica sem artefato reproduzível correspondente.',
] as const;

type EntryOptions = Partial<
  Omit<
    EditorialManifestEntry,
    | 'slug'
    | 'href'
    | 'title'
    | 'summary'
    | 'category'
    | 'kind'
    | 'stage'
    | 'evidenceLevel'
    | 'contentVersion'
    | 'sources'
    | 'limitations'
  >
> &
  Pick<EditorialManifestEntry, 'sources' | 'limitations'>;
function entry(
  slug: string,
  href: string,
  title: string,
  summary: string,
  category: string,
  kind: EditorialKind,
  stage: DidacticStage,
  evidenceLevel: EditorialEvidenceLevel,
  options: EntryOptions = { sources: [], limitations: BASE_LIMITATIONS },
): EditorialManifestEntry {
  return {
    slug,
    href,
    title,
    summary,
    category,
    kind,
    stage,
    evidenceLevel,
    contentVersion: 'editorial-v8.1',
    reviewedAt: '2026-08-22',
    ...options,
  };
}

export const EDITORIAL_ENTRIES: readonly EditorialManifestEntry[] = [
  entry(
    'manifesto-sota-axiomas',
    '/biblioteca/manifesto-sota-axiomas',
    'Manifesto SOTA: Perspectiva Matemática',
    'Tese autoral que organiza hipóteses de modelagem dinâmica e comportamento.',
    'fundamentos',
    'manifesto',
    'foundation',
    'hypothesis',
    {
      sources: ['docs/research/pmev/PMEV_SPEC_V0_1.md'],
      limitations: [
        'Manifesto é texto programático; seus termos não constituem axiomas matemáticos demonstrados.',
        ...BASE_LIMITATIONS,
      ],
      nextSlugs: ['entendendo-o-icm-e-suas-heuristicas', 'leitura-icm'],
    },
  ),
  entry(
    'hierarquia-da-decisao',
    '/biblioteca/hierarquia-da-decisao',
    'Hierarquia da Decisão',
    'Proposta de camadas para organizar análise de estados, previsão e risco.',
    'fundamentos',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: ['docs/research/pmev/PMEV_SPEC_V0_1.md'],
      limitations: BASE_LIMITATIONS,
      prerequisites: ['entendendo-o-icm-e-suas-heuristicas'],
    },
  ),
  entry(
    'estado-da-arte',
    '/biblioteca/estado-da-arte',
    'Estado da Arte GOLD',
    'Leitura editorial de tendências, ferramentas e problemas de decisão em MTT.',
    'fundamentos',
    'methodology',
    'evidence',
    'review_required',
    {
      sources: [],
      limitations: [
        'Observações de mercado exigem fontes datadas e amostras auditáveis antes de inferência geral.',
        ...BASE_LIMITATIONS,
      ],
    },
  ),
  entry(
    'smart-sniper',
    '/biblioteca/smart-sniper',
    'Protocolo Smart Sniper',
    'Método proposto de seleção de spots, volume e avaliação de risco.',
    'fundamentos',
    'methodology',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: [],
      limitations: [
        'O protocolo ainda não possui dataset, baseline, seed e intervalo de confiança versionados.',
        ...BASE_LIMITATIONS,
      ],
      nextSlugs: ['validacao-smart-sniper'],
    },
  ),
  entry(
    'validacao-smart-sniper',
    '/biblioteca/validacao-smart-sniper',
    'Avaliação do Smart Sniper',
    'Protocolo para transformar uma tese operacional em experimento auditável.',
    'fundamentos',
    'methodology',
    'evidence',
    'review_required',
    {
      sources: [],
      limitations: [
        'Não há artefato versionado de dados, código, seed, intervalos de confiança ou replicação que sustente validação científica.',
      ],
      prerequisites: ['smart-sniper'],
    },
  ),
  entry(
    'downward-drift-sota',
    '/biblioteca/downward-drift-sota',
    'Downward Drift & Compressão',
    'Hipótese de mudança de sizing e frequência sob pressão de ICM.',
    'mecanica',
    'laboratory',
    'dynamic_hypotheses',
    'hypothesis',
    { sources: ['docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md'], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'geometria-do-risco',
    '/biblioteca/geometria-do-risco',
    'Geometria do Risco',
    'Leitura conceitual de assimetria de risco, BF e RP.',
    'mecanica',
    'theory',
    'icm_baseline',
    'observation',
    {
      sources: ['https://blog.gtowizard.com/how-to-review-icm-preflop-ranges/'],
      limitations: [
        'Conversões BF/RP exatas requerem o caso binário simétrico; não substituem modelagem de ranges, bounties ou árvores pós-flop.',
      ],
    },
  ),
  entry(
    'entendendo-o-icm-e-suas-heuristicas',
    '/biblioteca/entendendo-o-icm-e-suas-heuristicas',
    'Entendendo ICM e Heurísticas',
    'Introdução ao ICM, à não linearidade e ao uso cuidadoso de heurísticas.',
    'mecanica',
    'lesson',
    'icm_baseline',
    'observation',
    {
      sources: ['https://blog.gtowizard.com/how-to-review-icm-preflop-ranges/'],
      limitations: ['Heurísticas não são substituto de cálculo de ICM parametrizado para a estrutura real.'],
      nextSlugs: ['leitura-icm', 'icm-masterclass'],
    },
  ),
  entry(
    'heuristica-icm-pos-flop-aula',
    '/biblioteca/heuristica-icm-pos-flop-aula',
    'Heurística ICM Pós-Flop',
    'Hipóteses operacionais para aplicar ICM a árvores pós-flop.',
    'mecanica',
    'lesson',
    'dynamic_hypotheses',
    'hypothesis',
    { sources: ['docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md'], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'motor-diluicao',
    '/biblioteca/motor-diluicao',
    'Motor de Diluição de Edge',
    'Modelo conceitual de como complexidade e multiway afetam a realização.',
    'mecanica',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    { sources: [], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'teto-equidade-river-icm',
    '/biblioteca/teto-equidade-river-icm',
    'Teto de Equidade River ICM',
    'Hipótese de fronteiras de decisão no river sob estruturas específicas.',
    'mecanica',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: ['docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md'],
      limitations: [
        'Não há teto universal de RP ou equidade aplicável a todas as árvores e estruturas de premiação.',
        ...BASE_LIMITATIONS,
      ],
    },
  ),
  entry(
    'estruturas-de-torneio',
    '/biblioteca/estruturas-de-torneio',
    'Estruturas de Torneio',
    'Como curvas de premiação e stacks mudam o problema de ICM.',
    'mecanica',
    'theory',
    'icm_baseline',
    'observation',
    {
      sources: ['https://blog.gtowizard.com/the-theory-of-bounty-tournaments-part-2-icm-and-equity-drops/'],
      limitations: [
        'Não existem cortes percentuais universais para definir uma estrutura; calcule para o payout efetivo.',
      ],
    },
  ),
  entry(
    'paradoxo-valuation',
    '/biblioteca/paradoxo-valuation',
    'Paradoxo da Valuation',
    'Discussão sobre valor marginal de fichas e assimetria de perdas.',
    'valuation',
    'theory',
    'icm_baseline',
    'observation',
    { sources: ['https://blog.gtowizard.com/how-to-review-icm-preflop-ranges/'], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'axioma-ev-fold-dinamico',
    '/biblioteca/axioma-ev-fold-dinamico',
    'EV do Fold Dinâmico',
    'Convenções de EV incremental e hipóteses sobre valor de continuação.',
    'valuation',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: ['docs/research/pmev/PMEV_SPEC_V0_1.md'],
      limitations: [
        'EV_fold depende da convenção adotada: em EV incremental após o investimento, fold normalmente é a linha de base; não use o termo sem declarar o referencial.',
        ...BASE_LIMITATIONS,
      ],
    },
  ),
  entry(
    'insolvencia-das-pot-odds',
    '/biblioteca/insolvencia-das-pot-odds',
    'Pot Odds e Custos Futuros',
    'Limites de usar apenas preço imediato em decisões com streets futuras.',
    'valuation',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: [],
      limitations: [
        'Pot odds continuam corretas como componente local; custos futuros devem ser quantificados, não inferidos por fórmula geral sem calibração.',
        ...BASE_LIMITATIONS,
      ],
    },
  ),
  entry(
    'risco-de-ressurreicao',
    '/biblioteca/risco-de-ressurreicao',
    'Risco de Ressurreição',
    'Hipótese sobre custo estratégico de devolver fichas a stacks curtos.',
    'valuation',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    { sources: [], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'fator-psi-maluquice-humana',
    '/biblioteca/fator-psi-maluquice-humana',
    'Fator Ψ',
    'Proposta de modelagem de incerteza comportamental do field.',
    'psicologia',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: [],
      limitations: [
        'Frequências comportamentais exigem amostra, definição operacional, viés de seleção e atualização bayesiana explícitos.',
        ...BASE_LIMITATIONS,
      ],
    },
  ),
  entry(
    'hermeneutica-blefe',
    '/biblioteca/hermeneutica-blefe',
    'Hermenêutica do Blefe',
    'Estrutura interpretativa para hipóteses sobre linhas e ranges.',
    'psicologia',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    { sources: [], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'psicologia-high-stakes',
    '/biblioteca/psicologia-high-stakes',
    'Psicologia High Stakes',
    'Discussão de pressão, autorregulação e qualidade de decisão.',
    'psicologia',
    'theory',
    'foundation',
    'observation',
    {
      sources: [],
      limitations: ['Generalizações psicológicas não substituem avaliação individual ou evidência clínica.'],
    },
  ),
  entry(
    'exegese-da-decisao',
    '/biblioteca/exegese-da-decisao',
    'Exegese da Decisão',
    'Roteiro de decomposição de mão, hipóteses e alternativas.',
    'laboratorios',
    'laboratory',
    'laboratory',
    'review_required',
    {
      sources: [],
      limitations: [
        'Uma análise só é reprodutível quando inclui hand history, ranges, configuração e versão do motor.',
      ],
    },
  ),
  entry(
    'voce-aprende-poker-errado',
    '/biblioteca/voce-aprende-poker-errado',
    'Amortização da Edge',
    'Tese sobre transferência, resolução e degradação de vantagem.',
    'laboratorios',
    'theory',
    'dynamic_hypotheses',
    'hypothesis',
    { sources: [], limitations: BASE_LIMITATIONS },
  ),
  entry(
    'teoria-da-perspectiva',
    '/biblioteca/teoria-da-perspectiva',
    'Teoria da Perspectiva',
    'Introdução à teoria de decisão sob risco e sua tradução cuidadosa para poker.',
    'laboratorios',
    'theory',
    'foundation',
    'externally_replicated',
    {
      sources: ['Kahneman, D.; Tversky, A. (1979). Prospect Theory: An Analysis of Decision under Risk. Econometrica.'],
      limitations: [
        'A teoria descreve escolhas sob risco em seus desenhos experimentais; aplicar seus parâmetros diretamente a poker requer validação própria.',
      ],
    },
  ),
  entry(
    'falacia-equilibrio-pedagogia',
    '/biblioteca/falacia-equilibrio-pedagogia',
    'Falácia do Equilíbrio',
    'Ensaio pedagógico sobre limites de simplificar GTO e exploit.',
    'laboratorios',
    'methodology',
    'foundation',
    'review_required',
    {
      sources: [],
      limitations: ['É uma crítica editorial; não mede por si só qualidade de ensino nem desempenho de jogadores.'],
    },
  ),
  entry(
    'laboratorio-chipev-vs-icmev',
    '/biblioteca/laboratorio-chipev-vs-icmev',
    'Laboratório ChipEV vs ICMev',
    'Comparador didático para distinguir duas funções objetivo.',
    'laboratorios',
    'laboratory',
    'laboratory',
    'reproducible_experiment',
    {
      sources: ['engine/icm_matrix.py', 'frontend/src/lib/icmMatrix.ts'],
      methodRef: 'Cenários parametrizados pelo usuário; o resultado não representa recomendação universal.',
      limitations: [
        'O laboratório não substitui solver de árvore pós-flop nem inclui automaticamente ranges, rake ou bounties.',
      ],
    },
  ),
  entry(
    'toy-games',
    '/biblioteca/toy-games',
    'Toy Games',
    'Cenários reduzidos para isolar hipóteses estratégicas.',
    'laboratorios',
    'laboratory',
    'laboratory',
    'reproducible_experiment',
    {
      sources: [
        'Entendendo o ICM e suas Heurísticas: frontend/src/app/(public)/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx.',
      ],
      methodRef: 'Estudo Toy Games verificado; cada cenário preserva seus inputs didáticos e seu domínio de validade.',
      limitations: [
        'O estudo valida os mecanismos sob seus cenários controlados; mesas reais exigem inputs, ranges e árvore próprios antes de transportar frequências.',
      ],
    },
  ),
  entry(
    'nos-de-calibragem',
    '/biblioteca/nos-de-calibragem',
    'Nós de Calibração',
    'Checklist para registrar e confrontar hipóteses estratégicas.',
    'laboratorios',
    'methodology',
    'evidence',
    'review_required',
    {
      sources: [],
      limitations: ['Nenhuma calibração é validada sem inputs, versão do motor, artefatos e repetição independente.'],
    },
  ),
  entry(
    'leitura-icm',
    '/aulas/leitura-icm',
    'Teoria da Perspectiva Matemática',
    'Whitepaper de proposta para extensão dinâmica do ICM.',
    'aulas',
    'lesson',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: ['docs/research/pmev/PMEV_SPEC_V0_1.md'],
      methodRef: 'docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md',
      limitations: BASE_LIMITATIONS,
      prerequisites: ['entendendo-o-icm-e-suas-heuristicas'],
      nextSlugs: ['icm-masterclass', 'icm-pos-flop'],
    },
  ),
  entry(
    'conceitos-icm',
    '/aulas/conceitos-icm',
    'Conceitos ICM',
    'Glossário de conceitos, convenções e limites de aplicação.',
    'aulas',
    'lesson',
    'icm_baseline',
    'observation',
    {
      sources: ['https://blog.gtowizard.com/how-to-review-icm-preflop-ranges/'],
      limitations: ['Definições são pedagógicas; confirme a convenção de EV e o modelo antes de comparar números.'],
      nextSlugs: ['leitura-icm'],
    },
  ),
  entry(
    'icm-masterclass',
    '/aulas/icm-masterclass',
    'Geometria do Risco',
    'Aula sobre decisão pós-flop e hipóteses de pressão de ICM.',
    'aulas',
    'lesson',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: ['docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md'],
      limitations: [
        'Downward Drift e defesa no river são hipóteses condicionadas a estados e árvores comparáveis.',
        ...BASE_LIMITATIONS,
      ],
      prerequisites: ['conceitos-icm', 'leitura-icm'],
      nextSlugs: ['icm-pos-flop'],
    },
  ),
  entry(
    'icm-pos-flop',
    '/aulas/icm-pos-flop',
    'ICM Pós-Flop: D6',
    'Vocabulário experimental para variáveis de decisão por street.',
    'aulas',
    'lesson',
    'dynamic_hypotheses',
    'hypothesis',
    {
      sources: ['docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md'],
      limitations: [
        'D6 é especificação experimental: fórmulas, coeficientes e limiares exigem calibração e teste reproduzível.',
        ...BASE_LIMITATIONS,
      ],
      prerequisites: ['icm-masterclass'],
    },
  ),
] as const;

export const EDITORIAL_MANIFEST: Readonly<Record<string, EditorialManifestEntry>> = Object.freeze(
  Object.fromEntries(EDITORIAL_ENTRIES.map((item) => [item.slug, item])),
);
const DEFAULT_ENTRY: Omit<
  EditorialManifestEntry,
  'slug' | 'href' | 'title' | 'summary' | 'category' | 'kind' | 'stage'
> = {
  evidenceLevel: 'review_required',
  contentVersion: 'unversioned-db',
  sources: [],
  limitations: [
    'Conteúdo recuperado sem manifesto editorial versionado; revisão metodológica e de proveniência necessária antes de qualquer selo de validação.',
  ],
};
export function getEditorialManifestEntry(slug: string): EditorialManifestEntry {
  return (
    EDITORIAL_MANIFEST[slug] ?? {
      slug,
      href: `/biblioteca/${slug}`,
      title: slug,
      summary: '',
      category: 'unclassified',
      kind: 'methodology',
      stage: 'evidence',
      ...DEFAULT_ENTRY,
    }
  );
}
export function getLibraryCategories() {
  return LIBRARY_CATEGORIES.map((category) => ({
    ...category,
    articles: EDITORIAL_ENTRIES.filter((item) => item.category === category.id),
  }));
}
const EVIDENCE_LABELS: Readonly<Record<EditorialEvidenceLevel, string>> = {
  observation: 'Observação',
  hypothesis: 'Hipótese PMev',
  reproducible_experiment: 'Experimento reproduzível',
  externally_replicated: 'Base replicada externamente',
  scientific_contribution: 'Contribuição científica',
  review_required: 'Revisão metodológica necessária',
};
const STAGE_LABELS: Readonly<Record<DidacticStage, string>> = {
  foundation: 'Fundamentos',
  icm_baseline: 'Base ICM',
  dynamic_hypotheses: 'Hipóteses dinâmicas',
  laboratory: 'Laboratório',
  evidence: 'Evidência e método',
};
export function getEditorialEvidenceLabel(level: EditorialEvidenceLevel): string {
  return EVIDENCE_LABELS[level];
}
export function getDidacticStageLabel(stage: DidacticStage): string {
  return STAGE_LABELS[stage];
}
