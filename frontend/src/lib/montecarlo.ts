/**
 * IDENTITY: Motor Monte Carlo ICM (Aproximação Estocástica O(N))
 * ROLE: Substitui a explosão combinatória O(2^N) do Malmuth-Harville
 *       para fields grandes (N > 10), permitindo simulações de MTT.
 * FONTE: Adaptado de algoritmos Open Source (poker-mtt-icm / poker-apprentice).
 */

export interface MonteCarloConfig {
	iterations?: number | undefined;
	/**
	 * Semente de 32 bits sem sinal. Omitir NAO significa "sem semente": significa
	 * "sorteie uma e me devolva". O valor efetivo volta em `MonteCarloIcmResult.seed`
	 * e reexecutar com ele reproduz a corrida bit a bit.
	 */
	seed?: number | undefined;
}

export interface MonteCarloIcmResult {
	/** Equity monetária média por jogador (mesma unidade de `prizes`). */
	equities: number[];
	/** Erro padrão de Bernoulli por slot: √(p·(1-p)/N). */
	stdErrorPerPlayer: number[];
	/**
	 * Semente efetivamente usada — nunca nula, inclusive quando `config.seed` foi
	 * omitido. É o que torna a corrida replayável depois do fato.
	 */
	seed: number;
	iterations: number;
}

/**
 * Sorteia uma semente de 32 bits para uma corrida que não declarou a sua.
 *
 * Fonte única desta derivação no repositório: o `IcmWorkerPool` a importa daqui
 * em vez de manter cópia própria. Preferimos `crypto.getRandomValues` por ser a
 * fonte de entropia disponível nos dois runtimes (browser e Node >= 19); o
 * fallback por relógio existe só para ambientes sem WebCrypto e nunca protege
 * nada — o valor sorteado é publicado no resultado.
 */
export function deriveSeed(): number {
	if (typeof globalThis.crypto?.getRandomValues === 'function') {
		const buf = new Uint32Array(1);
		globalThis.crypto.getRandomValues(buf);
		const val = buf.at(0);
		if (val !== undefined) return val >>> 0;
	}
	const perfTime = typeof performance !== 'undefined' ? performance.now() * 1000 : 0;
	return ((Date.now() ^ Math.floor(perfTime)) >>> 0) || 0xdeadbeef;
}

/**
 * mulberry32 — gerador determinístico de 32 bits, ciclo único de 2^32.
 *
 * Exportado para que o teste possa congelar um vetor conhecido: trocar o gerador
 * muda todo resultado já publicado com uma dada semente, e essa troca tem que
 * reprovar um teste em vez de passar silenciosa.
 *
 * O nome no comentário anterior dizia "SplitMix32"; é mulberry32. A aritmética
 * está correta, o rótulo não estava.
 */
export function seededRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0; // wrap signed 32-bit é exigência do algoritmo
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function pickWinnerWithBusted(
	numPlayers: number,
	stacks: number[],
	isBusted: Uint8Array,
	r: number,
): number {
	let cumulative = 0;
	let lastActiveIdx = -1;
	for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
		if (isBusted[playerIdx] === 0) {
			lastActiveIdx = playerIdx;
			cumulative += stacks[playerIdx] ?? 0;
			if (r <= cumulative) return playerIdx;
		}
	}
	return lastActiveIdx;
}

function pickWinnerWithMask(
	numPlayers: number,
	stacks: number[],
	availablePlayers: number,
	r: number,
): number {
	let cumulative = 0;
	let lastActiveIdx = -1;
	for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
		if ((availablePlayers & (1 << playerIdx)) !== 0) {
			lastActiveIdx = playerIdx;
			cumulative += stacks[playerIdx] ?? 0;
			if (r <= cumulative) return playerIdx;
		}
	}
	return lastActiveIdx;
}

function pickWinner(
	numPlayers: number,
	stacks: number[],
	availablePlayers: number,
	isBusted: Uint8Array | null,
	remainingTotalChips: number,
	random: () => number,
): number {
	// `random` aqui e sempre `seededRandom`: nao ha mais caminho que caia em
	// Math.random, que era o gatilho do typescript:S2245 neste arquivo. Continua
	// valendo por que nao e um CSPRNG: este e o sorteio de vencedor de uma
	// simulacao de Monte Carlo para ICM — nao protege nada, nao gera token, nao
	// deriva chave. E o oposto do que um CSPRNG oferece: aqui a reprodutibilidade
	// e o requisito, e um CSPRNG a destruiria por construcao.
	const r = random() * remainingTotalChips;
	if (isBusted) {
		return pickWinnerWithBusted(numPlayers, stacks, isBusted, r);
	}
	return pickWinnerWithMask(numPlayers, stacks, availablePlayers, r);
}


function runSingleMonteCarloIteration(
	numPlayers: number,
	stacks: number[],
	activePrizes: number[],
	totalChips: number,
	totalEquity: number[],
	isBusted: Uint8Array | null,
	random: () => number,
) {
	let remainingTotalChips = totalChips;
	let availablePlayers = (1 << numPlayers) - 1; // Bitmask (funciona rápido até 31 jogadores)

	if (isBusted) {
		isBusted.fill(0);
	}

	for (const prize of activePrizes) {
		if (remainingTotalChips <= 0) break;

		const winnerIdx = pickWinner(
			numPlayers,
			stacks,
			availablePlayers,
			isBusted,
			remainingTotalChips,
			random,
		);

		// Distribui o prêmio e remove o jogador da pool
		if (winnerIdx !== -1) {
			totalEquity[winnerIdx] = (totalEquity[winnerIdx] ?? 0) + (prize || 0);
			remainingTotalChips -= stacks[winnerIdx] || 0;

			if (isBusted) {
				isBusted[winnerIdx] = 1;
			} else {
				availablePlayers &= ~(1 << winnerIdx); // Limpa o bit
			}
		}
	}
}

/**
 * Calcula o ICM usando o método de Monte Carlo (Random Walk).
 * Sorteia o 1º colocado baseado na proporção de fichas.
 * Remove o vencedor, recalcula as proporções, sorteia o 2º, e assim por diante.
 *
 * A corrida é sempre determinística: dada a mesma `seed`, os mesmos `stacks`,
 * os mesmos `prizes` e o mesmo `iterations`, o resultado é idêntico bit a bit.
 * Omitir `config.seed` sorteia uma semente e a devolve em `result.seed`, de modo
 * que qualquer corrida possa ser reexecutada depois do fato.
 *
 * @param stacks Array com os stacks dos jogadores
 * @param prizes Array com a estrutura de premiação
 * @param config Configurações de iteração (default: 10000 para velocidade web)
 * @returns `MonteCarloIcmResult` com equities, stdErrorPerPlayer, seed e iterations.
 */
export function calculateIcmMonteCarlo(
	stacks: number[],
	prizes: number[],
	config: MonteCarloConfig = {},
): MonteCarloIcmResult {
	const iterations = config.iterations ?? 10000;
	if (!Number.isSafeInteger(iterations) || iterations < 1) throw new RangeError('Iterations must be a positive integer');
	if (config.seed !== undefined && (!Number.isSafeInteger(config.seed) || config.seed < 0 || config.seed > 0xffffffff)) {
		throw new RangeError('Seed must be an unsigned 32-bit integer');
	}
	// Omitir a semente nao dispensa semente: sorteamos uma, usamos, e devolvemos.
	// Antes, o caminho sem semente caia em Math.random e a corrida era irreplayavel
	// -- `seed: null` no resultado significava, na pratica, "ninguem consegue mais
	// reproduzir este numero".
	const resolvedSeed = config.seed ?? deriveSeed();
	const random = seededRandom(resolvedSeed);
	const numPlayers = stacks.length;

	// Se há mais prêmios que jogadores, trunca os prêmios
	const activePrizes = prizes.slice(0, numPlayers);
	const totalEquity = new Array(numPlayers).fill(0);

	// Se todos os stacks são 0, ou não há prêmios
	const totalChips = stacks.reduce((a, b) => a + b, 0);
	if (totalChips <= 0 || activePrizes.length === 0) {
		return { equities: totalEquity, stdErrorPerPlayer: totalEquity.map(() => 0), seed: resolvedSeed, iterations: 0 };
	}

	// N > 30: bitmask JS de 32 bits não comporta — usa Uint8Array alocada uma vez.
	const isBusted = numPlayers > 30 ? new Uint8Array(numPlayers) : null;
	if (numPlayers > 30 && !isBusted) {
		throw new RangeError(`Monte Carlo ICM: numPlayers=${numPlayers} requer isBusted=Uint8Array para N > 30.`);
	}

	for (let i = 0; i < iterations; i++) {
		runSingleMonteCarloIteration(numPlayers, stacks, activePrizes, totalChips, totalEquity, isBusted, random);
	}

	// Média e erro padrão por slot (escalado pela premiação total ativa)
	const totalActivePrize = activePrizes.reduce((a, b) => a + b, 0);
	const equities = totalEquity.map((e) => e / iterations);
	const stdErrorPerPlayer = equities.map((eq) => {
		if (totalActivePrize <= 0) return 0;
		const p = Math.max(0, Math.min(1, eq / totalActivePrize));
		return Number((totalActivePrize * Math.sqrt((p * (1 - p)) / Math.max(iterations, 1))).toFixed(4));
	});

	return { equities, stdErrorPerPlayer, seed: resolvedSeed, iterations };
}
