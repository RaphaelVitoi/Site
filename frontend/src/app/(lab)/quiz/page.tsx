'use client';

/**
 * IDENTITY: Templo de Quiz & Avaliação Cognitiva SOTA v7.0 GOLD
 * PATH: src/app/(lab)/quiz/page.tsx
 * ROLE: Laboratório interativo de validação neural e assimilação dos axiomas de Raphael Vitoi.
 * DESIGN: Container centralizado simétrico com telemetria quântica e feedback em tempo real.
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { QuizEngine } from '@/components/quiz/QuizEngine';
import { type QuizQuestion } from '@/components/quiz/types';

const SOTA_QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: 'q1',
		category: 'Risk Premium',
		text: 'Qual é a definição exata do Risk Premium (RP) no modelo de Perspectiva Matemática?',
		options: [
			{ id: 'opt1', label: 'É o valor percentual que você deve subtrair do seu stack ao fazer um call.' },
			{
				id: 'opt2',
				label: 'É a equidade adicional exigida além das Pot Odds puras em fichas devido à não-linearidade do valor monetário.',
			},
			{ id: 'opt3', label: 'É o rake cobrado pelo torneio nas mesas finais.' },
			{ id: 'opt4', label: 'É a taxa de variância de um jogador nos primeiros 100 torneios.' },
		],
		correctOptionId: 'opt2',
		explanation:
			'O Risk Premium representa a penalidade matemática imposta pelo ICM: como perder fichas destrói mais utilidade ($) do que ganhar a mesma quantidade gera, exige-se equidade extra para justificar o confronto.',
	},
	{
		id: 'q2',
		category: 'Pos-Flop',
		text: 'O que define o fenômeno do "Downward Drift" no pós-flop sob pressão de ICM?',
		options: [
			{ id: 'opt1', label: 'Os jogadores aumentam o tamanho das apostas sucessivamente a cada street.' },
			{
				id: 'opt2',
				label: 'A compressão das ranges e a redução geométrica dos sizings médios de aposta para conter o risco de ruína.',
			},
			{ id: 'opt3', label: 'A queda de conexão durante partidas online.' },
			{ id: 'opt4', label: 'A perda gradual de stack blinds após blinds.' },
		],
		correctOptionId: 'opt2',
		explanation:
			'No pós-flop com ICM elevado, o valor da sobrevivência força sizings menores (15-33% pot) e aumento de frequências de check/call passivo, pois potes gigantes geram assimetria destrutiva de valor.',
	},
	{
		id: 'q3',
		category: 'Bolha',
		text: 'Qual a relação geométrica direta entre o Bubble Factor (BF) e o Risk Premium (RP)?',
		options: [
			{ id: 'opt1', label: 'RP e BF são termos idênticos sem distinção formal.' },
			{
				id: 'opt2',
				label: 'BF mede a razão entre o custo da derrota e o ganho da vitória ($Loss / $Gain), derivando o RP = Equidade Exigida - Pot Odds.',
			},
			{ id: 'opt3', label: 'O Bubble Factor é sempre zero no pré-flop.' },
			{ id: 'opt4', label: 'O Risk Premium é a raiz quadrada do Bubble Factor.' },
		],
		correctOptionId: 'opt2',
		explanation:
			'O Bubble Factor ($/Loss / $/Gain) calibra a convexidade da função de pagamento do torneio, estabelecendo matematicamente a margem de segurança (RP) necessária para qualquer decisão com risco de eliminação.',
	},
	{
		id: 'q4',
		category: 'Fundamentos SOTA',
		text: 'Por que o conceito de EV fold não é zero em um torneio de poker (Axioma do EV Fold Dinâmico)?',
		options: [
			{ id: 'opt1', label: 'Porque o fold custa o valor dos antes imediatamente.' },
			{
				id: 'opt2',
				label: 'Porque ao foldar, você preserva o stack e captura a equidade da sobrevivência enquanto outros jogadores se eliminam.',
			},
			{ id: 'opt3', label: 'Porque o software cobra uma penalidade por inatividade.' },
			{ id: 'opt4', label: 'Porque o fold garante premiação imediata.' },
		],
		correctOptionId: 'opt2',
		explanation:
			'Em MTTs com payouts não-lineares, foldar possui valor positivo dinâmico (EV_fold > 0) decorrente da amortização de sobrevivência e das colisões alheias (efeito carona da bolha).',
	},
	{
		id: 'q5',
		category: 'quiz',
		text: 'Por que a tipografia tabular-nums e arquitetura O(1) de estados são essenciais no ecossistema SOTA?',
		options: [
			{ id: 'opt1', label: 'Apenas por preferência estética de design.' },
			{
				id: 'opt2',
				label: 'Garantem zero jitter visual nos cronômetros/números e tempo de renderização determinístico sob alta carga.',
			},
			{ id: 'opt3', label: 'São requisitos da biblioteca Tailwind v4.' },
			{ id: 'opt4', label: 'Permitem converter o Next.js em WebAssembly.' },
		],
		correctOptionId: 'opt2',
		explanation:
			'Fontes com largura tabular evitam deslocamento de layout (Cumulative Layout Shift - CLS = 0) e estruturas indexadas por chave (Record/Map) conferem acesso O(1) com zero latência cognitiva.',
	},
];

export default function QuizPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Templo de Aprendizado"
				subtitle="Teste seus reflexos neurais, meça seu índice de absorção de risco e assimile as Leis Invariáveis da Perspectiva Matemática."
				category="Laboratório Cognitivo"
				icon="fa-brain"
			/>
			<div className="sota-container mt-10 md:mt-14">
				<QuizEngine questions={SOTA_QUIZ_QUESTIONS} />
			</div>
		</div>
	);
}
