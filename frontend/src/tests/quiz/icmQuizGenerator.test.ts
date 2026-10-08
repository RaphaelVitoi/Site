import { generateDynamicICMQuiz } from '@/components/quiz/icmQuizGenerator';

describe('generateDynamicICMQuiz', () => {
	it('retorna array vazio para entradas nulas, indefinidas ou sem stacks', () => {
		expect(generateDynamicICMQuiz({ stacks: [], prizes: [] })).toEqual([]);
		// @ts-expect-error teste defensivo para runtime
		expect(generateDynamicICMQuiz({ stacks: null, prizes: [] })).toEqual([]);
		// @ts-expect-error teste defensivo para runtime
		expect(generateDynamicICMQuiz({})).toEqual([]);
	});

	it('gera questão fundamental determinística para configuração padrão', () => {
		const questions1 = generateDynamicICMQuiz({
			stacks: [50, 50],
			prizes: [100],
		});
		const questions2 = generateDynamicICMQuiz({
			stacks: [50, 50],
			prizes: [100],
		});

		expect(questions1).toHaveLength(1);
		expect(questions1[0]?.id).toBe('q-dyn-fundamentos');
		expect(questions1[0]?.category).toBe('Fundamentos SOTA');
		expect(questions1[0]?.correctOptionId).toBe('opt2');
		// Garante determinismo absoluto (sem timestamps voláteis)
		expect(questions1).toEqual(questions2);
	});

	it('detecta cenário de bolha exata (stacks = prizes + 1) e inclui questão de bolha', () => {
		const questions = generateDynamicICMQuiz({
			stacks: [40, 30, 20, 10], // 4 jogadores
			prizes: [50, 30, 20],      // 3 premiados => bolha exata
		});

		const bubbleQ = questions.find((q) => q.id === 'q-dyn-bubble');
		expect(bubbleQ).toBeDefined();
		expect(bubbleQ?.category).toBe('Bolha');
		expect(bubbleQ?.correctOptionId).toBe('opt3');
	});

	it('detecta chip leader massivo (>40% das fichas) e inclui questão de predador', () => {
		const questions = generateDynamicICMQuiz({
			stacks: [60, 20, 20], // 60 de 100 = 60% (>40%) com 3 jogadores
			prizes: [100, 50],
		});

		const clQ = questions.find((q) => q.id === 'q-dyn-chipleader');
		expect(clQ).toBeDefined();
		expect(clQ?.category).toBe('Risk Premium');
		expect(clQ?.correctOptionId).toBe('opt2');
	});

	it('detecta estrutura top-heavy (>35% no 1º lugar) e inclui questão correspondente', () => {
		const questions = generateDynamicICMQuiz({
			stacks: [30, 30, 30],
			prizes: [80, 10, 10], // 80 de 100 = 80% (>35%)
		});

		const topHeavyQ = questions.find((q) => q.id === 'q-dyn-topheavy');
		expect(topHeavyQ).toBeDefined();
		expect(topHeavyQ?.category).toBe('Pos-Flop');
		expect(topHeavyQ?.correctOptionId).toBe('opt2');
	});

	it('detecta short stack crítico (<10% das fichas) e inclui questão de externalidade', () => {
		const questions = generateDynamicICMQuiz({
			stacks: [50, 45, 5], // 5 de 100 = 5% (<10%) com 3 jogadores
			prizes: [100, 50],
		});

		const shortQ = questions.find((q) => q.id === 'q-dyn-shortstack');
		expect(shortQ).toBeDefined();
		expect(shortQ?.category).toBe('simulator');
		expect(shortQ?.correctOptionId).toBe('opt1');
	});

	it('reordena dinamicamente as questões conforme o perfil preditivo Random Forest', () => {
		const baseState = {
			stacks: [60, 32, 8], // aciona CL e Short Stack
			prizes: [70, 20],     // aciona Top-Heavy e Bolha (3 jogadores, 2 prizes)
		};

		// Sem perfil, ordem natural: Fundamentos -> Bolha -> CL -> TopHeavy -> ShortStack
		const defaultOrder = generateDynamicICMQuiz(baseState);
		expect(defaultOrder.map((q) => q.id)).toEqual([
			'q-dyn-fundamentos',
			'q-dyn-bubble',
			'q-dyn-chipleader',
			'q-dyn-topheavy',
			'q-dyn-shortstack',
		]);

		// Com perfil priorizando 'Bolha' (peso 0.99)
		const prioritized = generateDynamicICMQuiz({
			...baseState,
			predictiveProfile: {
				Bolha: 0.99,
				'Fundamentos SOTA': 0.1,
			},
		});

		expect(prioritized[0]?.id).toBe('q-dyn-bubble');
	});

	it('lida defensivamente com pesos inválidos (NaN/não-numéricos) no perfil preditivo', () => {
		const baseState = {
			stacks: [60, 32, 8],
			prizes: [70, 20],
			predictiveProfile: {
				Bolha: NaN,
				'Fundamentos SOTA': undefined as unknown as number,
			},
		};

		expect(() => generateDynamicICMQuiz(baseState)).not.toThrow();
	});
});
