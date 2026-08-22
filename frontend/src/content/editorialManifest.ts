/** Fonte de verdade versionada para proveniência e status epistemológico. */

export type EditorialEvidenceLevel =
	| 'observation'
	| 'hypothesis'
	| 'reproducible_experiment'
	| 'externally_replicated'
	| 'scientific_contribution'
	| 'review_required';

export interface EditorialManifestEntry {
	slug: string;
	evidenceLevel: EditorialEvidenceLevel;
	contentVersion: string;
	reviewedAt?: string;
	sources: readonly string[];
	methodRef?: string;
	limitations: readonly string[];
}

const DEFAULT_ENTRY: Omit<EditorialManifestEntry, 'slug'> = {
	evidenceLevel: 'review_required',
	contentVersion: 'unversioned-db',
	sources: [],
	limitations: [
		'Conteúdo recuperado do banco sem manifesto editorial versionado para este slug.',
		'Revisão metodológica e de proveniência necessária antes de qualquer selo de validação.',
	],
};

export const EDITORIAL_MANIFEST: Readonly<Record<string, EditorialManifestEntry>> = {
	'leitura-icm': {
		slug: 'leitura-icm',
		evidenceLevel: 'hypothesis',
		contentVersion: 'pmev-v7-draft',
		reviewedAt: '2026-08-22',
		sources: ['docs/research/pmev/PMEV_SPEC_V0_1.md'],
		methodRef: 'docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md',
		limitations: [
			'PMev é uma extensão em desenvolvimento; superioridade preditiva ou decisória depende de validação fora da amostra.',
			'As afirmações sobre solver dependem da árvore, ranges, payouts, versão e parâmetros explicitamente publicados.',
		],
	},
	'icm-masterclass': {
		slug: 'icm-masterclass',
		evidenceLevel: 'hypothesis',
		contentVersion: 'pmev-v7-draft',
		reviewedAt: '2026-08-22',
		sources: ['docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md'],
		methodRef: 'H4/H8 controlled solver comparisons',
		limitations: [
			'Downward Drift e defesa no river são hipóteses condicionadas a estados e árvores comparáveis.',
		],
	},
	'validacao-smart-sniper': {
		slug: 'validacao-smart-sniper',
		evidenceLevel: 'review_required',
		contentVersion: 'methodology-pending',
		sources: [],
		limitations: [
			'Não há artefato versionado de dados, código, seed, intervalos de confiança ou replicação que sustente validação científica.',
		],
	},
};

const EVIDENCE_LABELS: Readonly<Record<EditorialEvidenceLevel, string>> = {
	observation: 'Observação',
	hypothesis: 'Hipótese PMev',
	reproducible_experiment: 'Experimento reproduzível',
	externally_replicated: 'Replicado externamente',
	scientific_contribution: 'Contribuição científica',
	review_required: 'Revisão metodológica necessária',
};

export function getEditorialManifestEntry(slug: string): EditorialManifestEntry {
	return EDITORIAL_MANIFEST[slug] ?? { slug, ...DEFAULT_ENTRY };
}

export function getEditorialEvidenceLabel(level: EditorialEvidenceLevel): string {
	return EVIDENCE_LABELS[level];
}
