/**
 * @jest-environment node
 */
import { escapePdfText, linhasDoCenario, MAX_MAOS_NO_TRATADO, validarParametrosDoTratado } from './pmev-pdf-params';

describe('linhasDoCenario (pend-2026-09-16-pdf-numeros-fixos)', () => {
	const base = { stack: 31.2, bf: 1.7, time: 9, pmevThreshold: 0.415, expandedHands: ['AA', 'KQs'] };

	it('não afirma número que a exportação não mediu', () => {
		const texto = linhasDoCenario(base).join('\n');
		for (const fabricado of ['100.000', '-6.33', '68.4', '49.5', '+2.13', '18.63', '41%']) {
			expect(texto).not.toContain(fabricado);
		}
		expect(texto).toContain('Nenhuma simulacao Monte Carlo foi executada');
	});

	it('usa os dados enviados, e declara o que não foi enviado', () => {
		const texto = linhasDoCenario(base).join('\n');
		expect(texto).toContain('31.2 BB');
		expect(texto).toContain('41.5%');
		expect(texto).toContain('AA, KQs');
		const semDados = linhasDoCenario({ ...base, pmevThreshold: null, expandedHands: null }).join('\n');
		expect(semDados).toContain('Limiar PMev: nao informado');
		expect(semDados).toContain('Nenhuma classe expandida');
	});

	it('a combinatória de blocker é a exata', () => {
		// Um As na mão: AA C(3,2)=3 de C(4,2)=6; AK 3*4=12 de 4*4=16.
		const texto = linhasDoCenario(base).join(' ');
		expect(texto).toContain('AA cai de 6 para 3 combos, -50%');
		expect(texto).toContain('16 para 12 combos cada, -25%');
	});

	it('toda linha cabe na página, é ASCII e sobrevive ao escape sem perda', () => {
		const muitas = { ...base, expandedHands: Array.from({ length: 169 }, () => 'AKs') };
		for (const linha of linhasDoCenario(muitas)) {
			expect(linha.length).toBeLessThanOrEqual(100);
			expect(escapePdfText(linha)).toBe(linha);
		}
	});
});

describe('pmev-pdf-params (BK-17)', () => {
	it('escapePdfText remove delimitadores, barra invertida e não-ASCII', () => {
		expect(escapePdfText('a (b) c\\')).toBe('a b c');
		expect(escapePdfText(') Tj ET BT (')).toBe(' Tj ET BT ');
		expect(escapePdfText('equidade çã\n')).toBe('equidade ');
		expect(escapePdfText('ação')).toBe('ao');
	});

	it('aceita o corpo real do PmevRangeViewer', () => {
		const p = validarParametrosDoTratado({
			stack_bb: 18.5,
			bubble_factor: 1.3,
			time_to_blind: 3,
			pmev_threshold: 0.43,
			expanded_hands: ['AA', 'AKs', '72o'],
		});
		expect(p).toEqual({ stack: 18.5, bf: 1.3, time: 3, pmevThreshold: 0.43, expandedHands: ['AA', 'AKs', '72o'] });
	});

	it('usa padrões quando o corpo vem vazio', () => {
		expect(validarParametrosDoTratado({})).toMatchObject({ stack: 18.5, bf: 2.45, time: 3, expandedHands: null });
	});

	it.each([
		[{ stack_bb: '18) Tj' }],
		[{ bubble_factor: Number.NaN }],
		[{ pmev_threshold: 2 }],
		[{ expanded_hands: 'AKs' }],
		[{ expanded_hands: ['AKs', 'x) Tj ET'] }],
		[{ expanded_hands: Array.from({ length: MAX_MAOS_NO_TRATADO + 1 }, () => 'AA') }],
	])('recusa entrada inválida %j', (corpo) => {
		expect(validarParametrosDoTratado(corpo)).toBeNull();
	});
});
