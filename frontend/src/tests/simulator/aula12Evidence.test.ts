/**
 * Contrato da ponte entre a evidência primária da Aula 1.2 e o motor bayesiano.
 *
 * O que ele trava não é "a soma fecha em 100" -- exigir isso obrigaria a reescrever o dígito que a captura mostra.
 * O que ele trava é a **distinção entre o medido e o derivado**: `pct` continua sendo o que foi lido, `largura` é
 * calculada, e `base` diz qual das duas origens produziu a largura.
 */

import { acoesComProcedencia, somaDasFrequencias } from '@/lib/aula12Evidence';
import { PAR_2_IP_APOS_CHECK } from '@/components/simulator/solver/evidencia/aula12Pairs';
import { read, unreadable, type EvidenceScenario } from '@/components/simulator/solver/evidenceContract';

describe('ponte de evidência da Aula 1.2', () => {
	describe('nó ChipEV do par 2 (GTO Wizard, figura 8) -- a captura expõe combos', () => {
		const acoes = acoesComProcedencia(PAR_2_IP_APOS_CHECK.chipEv);

		it('deriva a largura dos combos, que são o dado primário', () => {
			expect(acoes.every((a) => a.base === 'combos')).toBe(true);
		});

		it('as larguras somam exatamente 100 sem tocar em nenhuma frequência', () => {
			expect(acoes.reduce((s, a) => s + a.largura, 0)).toBeCloseTo(100, 9);
		});

		it('preserva o dígito lido, inclusive quando a soma das frequências dá 100.1', () => {
			expect(somaDasFrequencias(PAR_2_IP_APOS_CHECK.chipEv)).toBeCloseTo(100.1, 5);
			expect(acoes.find((a) => a.label === 'Bet 2.8 (50%)')?.pct).toBe(82.5);
			expect(acoes.find((a) => a.label === 'Check')?.pct).toBe(2.3);
		});

		it('a largura por combos difere da porcentagem arredondada, e é ela a mais exata', () => {
			const bet50 = acoes.find((a) => a.label === 'Bet 2.8 (50%)');
			expect(bet50?.combos).toBe(306.02);
			// 306.02 / 370.94 = 82.498...%, contra os 82.5 que a captura arredonda.
			expect(bet50?.largura).toBeCloseTo((306.02 * 100) / 370.94, 9);
			expect(bet50?.largura).not.toBe(82.5);
		});
	});

	describe('nó ICMev do par 2 (HRC) -- a captura NÃO expõe combos', () => {
		const acoes = acoesComProcedencia(PAR_2_IP_APOS_CHECK.icmEv);

		it('cai para a frequência e declara a queda em vez de fingir combos', () => {
			expect(acoes.every((a) => a.base === 'frequencia')).toBe(true);
			expect(acoes.every((a) => a.combos === null)).toBe(true);
		});

		it('ainda assim as larguras somam 100', () => {
			expect(acoes.reduce((s, a) => s + a.largura, 0)).toBeCloseTo(100, 9);
		});

		it('mantém a ação de frequência zero, que não é o mesmo que ação ausente', () => {
			const folds = acoes.find((a) => a.label === 'folds');
			expect(folds).toBeDefined();
			expect(folds?.pct).toBe(0);
		});
	});

	describe('bordas', () => {
		const cenario = (actions: EvidenceScenario['actions']): EvidenceScenario => ({
			regime: 'chipEV',
			solver: 'teste',
			actions,
		});

		it('um combo ilegível SAI POR SUBTRAÇÃO quando a captura declara o total', () => {
			const acoes = acoesComProcedencia({
				regime: 'chipEV',
				solver: 'teste',
				totalCombos: read(200),
				actions: [
					{ label: 'a', frequencyPct: read(40), combos: read(80) },
					{ label: 'b', frequencyPct: read(60), combos: unreadable('coluna cortada') },
				],
			});
			// 200 - 80 = 120. Aritmetica sobre valores lidos, nao chute -- e marcada como inferida.
			expect(acoes.every((a) => a.base === 'combos-com-inferido')).toBe(true);
			expect(acoes.find((a) => a.label === 'b')?.combos).toBe(120);
			expect(acoes[0]?.largura).toBeCloseTo(40, 9);
			expect(acoes.reduce((s, a) => s + a.largura, 0)).toBeCloseTo(100, 9);
		});

		it('sem total declarado, o combo ilegível rebaixa o conjunto para frequência', () => {
			const acoes = acoesComProcedencia(
				cenario([
					{ label: 'a', frequencyPct: read(40), combos: read(80) },
					{ label: 'b', frequencyPct: read(60), combos: unreadable('coluna cortada') },
				]),
			);
			expect(acoes.every((a) => a.base === 'frequencia')).toBe(true);
		});

		it('total menor que a soma conhecida NÃO vira combo negativo: cai para frequência', () => {
			const acoes = acoesComProcedencia({
				regime: 'chipEV',
				solver: 'teste',
				totalCombos: read(50),
				actions: [
					{ label: 'a', frequencyPct: read(40), combos: read(80) },
					{ label: 'b', frequencyPct: read(60), combos: unreadable() },
				],
			});
			expect(acoes.every((a) => a.base === 'frequencia')).toBe(true);
		});

		it('dois combos ilegíveis não são inferíveis por uma subtração só', () => {
			const acoes = acoesComProcedencia({
				regime: 'chipEV',
				solver: 'teste',
				totalCombos: read(200),
				actions: [
					{ label: 'a', frequencyPct: read(20), combos: read(40) },
					{ label: 'b', frequencyPct: read(40), combos: unreadable() },
					{ label: 'c', frequencyPct: read(40), combos: unreadable() },
				],
			});
			expect(acoes.every((a) => a.base === 'frequencia')).toBe(true);
		});

		it('não divide por zero quando todas as grandezas são zero', () => {
			const acoes = acoesComProcedencia(
				cenario([
					{ label: 'a', frequencyPct: read(0) },
					{ label: 'b', frequencyPct: read(0) },
				]),
			);
			expect(acoes.map((a) => a.largura)).toEqual([0, 0]);
		});

		it('cenário sem ações devolve lista vazia, não erro', () => {
			expect(acoesComProcedencia(cenario([]))).toEqual([]);
		});
	});
});
