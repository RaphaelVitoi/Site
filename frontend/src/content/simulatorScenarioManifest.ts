import type { EditorialEvidenceLevel } from './editorialManifest';

export interface SimulatorScenarioManifestEntry {
	evidenceLevel: EditorialEvidenceLevel;
	inputStatus: 'derived_from_inputs' | 'didactic_fixture' | 'review_required';
	sources: readonly string[];
	limitations: readonly string[];
}

export type SimulatorScenarioStatus = SimulatorScenarioManifestEntry['inputStatus'];

const DEFAULT_SCENARIO_ENTRY: SimulatorScenarioManifestEntry = {
	evidenceLevel: 'review_required',
	inputStatus: 'review_required',
	sources: [],
	limitations: [
		'Cenário didático sem pacote versionado de ranges, árvore, versão do solver, seed ou reprodução independente.',
		'Frequências, narrativas e diagnósticos devem ser lidos como hipótese operacional; não como recomendação universal.',
	],
};

const DIDACTIC_FIXTURE_ENTRY: SimulatorScenarioManifestEntry = {
	evidenceLevel: 'hypothesis',
	inputStatus: 'didactic_fixture',
	sources: [
		'Contrato PMev v0.1: docs/research/pmev/PMEV_SPEC_V0_1.md.',
		'Configuração didática: frontend/src/components/simulator/solver/scenarios.ts.',
	],
	limitations: [
		'Fixture didática: stacks, frequências e narrativa não substituem ranges, árvore de decisão, versão do solver, seed ou validação externa.',
		'Use para comparar hipóteses sob os inputs declarados; não como frequência prescritiva ou recomendação universal de jogo.',
	],
};

const VERIFIED_TOY_GAME_ENTRY: SimulatorScenarioManifestEntry = {
	evidenceLevel: 'reproducible_experiment',
	inputStatus: 'didactic_fixture',
	sources: [
		'Entendendo o ICM e suas Heurísticas: frontend/src/app/(public)/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx.',
		'Protocolo e visualizações do estudo Toy Games verificado.',
	],
	limitations: [
		'Estudo didático verificado sob os inputs do Toy Game; a transferência para uma mesa real requer recalcular payouts, stacks, ranges, bounties e árvore específicos.',
		'A validação do mecanismo no Toy Game não elimina a necessidade de solver/árvore para prescrever frequências em outro domínio.',
	],
};

export const SIMULATOR_SCENARIO_MANIFEST: Readonly<
	Record<string, SimulatorScenarioManifestEntry>
> = {
	chipev: {
		evidenceLevel: 'observation',
		inputStatus: 'derived_from_inputs',
		sources: ['engine/icm_matrix.py', 'frontend/src/lib/icmMatrix.ts'],
		limitations: [
			'ChipEV é uma baseline de utilidade linear; não incorpora payouts, bounties, ranges ou árvore pós-flop automaticamente.',
		],
	},
	'icmev-puro': {
		evidenceLevel: 'observation',
		inputStatus: 'derived_from_inputs',
		sources: [
			'George T. Gilbert (2009), The Independent Chip Model and Risk Aversion, arXiv:0911.3100.',
			'frontend/src/lib/icmMatrix.ts',
		],
		limitations: [
			'ICM depende dos stacks e payouts declarados; não modela habilidade, ação futura ou transições de torneio sem extensão adicional.',
		],
	},
	paradoxo: DIDACTIC_FIXTURE_ENTRY,
	pacto: DIDACTIC_FIXTURE_ENTRY,
	batata: DIDACTIC_FIXTURE_ENTRY,
	agonia: DIDACTIC_FIXTURE_ENTRY,
	lama: DIDACTIC_FIXTURE_ENTRY,
	ameaca: DIDACTIC_FIXTURE_ENTRY,
	especulacao: DIDACTIC_FIXTURE_ENTRY,
	'nodelock-b20': DIDACTIC_FIXTURE_ENTRY,
	sniper: VERIFIED_TOY_GAME_ENTRY,
	bully: VERIFIED_TOY_GAME_ENTRY,
};

export function getSimulatorScenarioManifestEntry(
	scenarioId: string
): SimulatorScenarioManifestEntry {
	return SIMULATOR_SCENARIO_MANIFEST[scenarioId] ?? DEFAULT_SCENARIO_ENTRY;
}
