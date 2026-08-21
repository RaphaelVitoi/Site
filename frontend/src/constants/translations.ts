/**
 * IDENTITY: Centralized UI Internationalization & Localized Dictionary (SOTA v7.0 GOLD)
 * PATH: src/constants/translations.ts
 * ROLE: Centraliza e desacopla todas as strings de interface do simulador
 *       e componentes de áudio neural para conformidade estrita de i18n.
 */

export const SIMULATOR_I18N = {
	ptBR: {
		matrix: {
			rows: 'Linhas:',
			cols: 'Colunas:',
			heroRole: 'Hero (Agressor / Decisor)',
			villainRole: 'Villain (Alvo / Confronto)',
			clickHint: '⚡ Clique em qualquer célula para injetar os RPs instantaneamente no Profiler de Nash abaixo',
			heroVsVillain: String.raw`Hero \ Villain`,
			matchupActive: 'MATCHUP TÁTICO ATIVO',
			effectiveChips: 'Fichas Efetivas:',
			injectButton: '⚡ Injetar no Profiler',
			sotaGuideline: 'Diretriz Estrutural SOTA:',
			heroCovers: 'Hero Cobre Vilão',
			villainCovers: 'Vilão Cobre Hero',
		},
		metrics: {
			bubbleFactor: 'Bubble Factor',
			heroRp: 'Hero RP (IP)',
			villainRp: 'Villain RP (OOP)',
			gainDelta: 'Δ$EV (Ganho)',
			lossDelta: 'Δ$EV (Perda)',
			riskAsymmetry: 'Assimetria de Risco',
		},
		voice: {
			transmitting: 'Transmitindo',
			play: 'Ouvir Insight',
			pause: 'Pausar',
			resume: 'Retomar',
			stop: 'Parar',
			speed: 'Velocidade:',
			voiceLabel: 'Voz:',
		},
	},
} as const;

export type SimulatorLocale = keyof typeof SIMULATOR_I18N;
export const currentLocale: SimulatorLocale = 'ptBR';
export const UI_I18N = SIMULATOR_I18N.ptBR;
