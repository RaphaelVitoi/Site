/**
 * Regret matching numa decisão única com utilidades fixas.
 *
 * O painel "CFR Convergence" do GtoCfrSimulator exibia FOLD 100% / CALL 0% / RAISE 0% de estado inicial, porque o worker
 * descartava o pedido de estratégia (SIM-01, auditoria do simulador de 2026-09-17). A estratégia agora sai daqui, sobre as
 * EVs de perspectiva do spot ativo, e só existe quando há spot.
 *
 * Com utilidades fixas, a estratégia média do regret matching converge para a melhor resposta pura: toda a massa vai para
 * a ação de maior EV, e ações empatadas no máximo dividem a massa. O custo é O(iterações × ações), microssegundos para 3
 * ações, e por isso roda na thread principal.
 */
export interface EstrategiaAcao {
	action: string;
	strategy: number;
}

export function estrategiaPorRegretMatching(
	evs: Readonly<Record<string, number>>,
	iteracoes = 1000,
): EstrategiaAcao[] | null {
	const acoes = Object.keys(evs);
	const utilidades = acoes.map((acao) => evs[acao] as number);
	if (acoes.length === 0 || utilidades.some((u) => !Number.isFinite(u))) return null;

	const arrependimento = new Float64Array(acoes.length);
	const somaEstrategia = new Float64Array(acoes.length);
	const estrategia = new Float64Array(acoes.length);

	for (let t = 0; t < iteracoes; t++) {
		let positivo = 0;
		for (let i = 0; i < acoes.length; i++) positivo += Math.max(0, arrependimento[i] as number);
		for (let i = 0; i < acoes.length; i++) {
			estrategia[i] = positivo > 0 ? Math.max(0, arrependimento[i] as number) / positivo : 1 / acoes.length;
			somaEstrategia[i] = (somaEstrategia[i] as number) + (estrategia[i] as number);
		}
		let utilidadeNo = 0;
		for (let i = 0; i < acoes.length; i++) utilidadeNo += (estrategia[i] as number) * (utilidades[i] as number);
		for (let i = 0; i < acoes.length; i++) {
			arrependimento[i] = (arrependimento[i] as number) + (utilidades[i] as number) - utilidadeNo;
		}
	}

	return acoes.map((action, i) => ({ action, strategy: ((somaEstrategia[i] as number) / iteracoes) * 100 }));
}
