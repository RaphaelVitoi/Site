/**
 * @jest-environment node
 */
import { mensagemDeErroDeDominio } from './domain-error-message';

class ErroDeCapacidade extends Error {}

describe('mensagemDeErroDeDominio (BK-15)', () => {
	it('expõe a mensagem de validação de domínio escrita para o usuário', () => {
		expect(mensagemDeErroDeDominio(new Error('Selecione um jogador.'), 'genérico')).toBe('Selecione um jogador.');
	});

	it('esconde a mensagem de falha de runtime', () => {
		const tipo = (() => {
			try {
				(undefined as unknown as { x: () => void }).x();
			} catch (e) {
				return e;
			}
		})();
		expect(mensagemDeErroDeDominio(tipo, 'genérico')).toBe('genérico');
		expect(mensagemDeErroDeDominio(new RangeError('Invalid array length'), 'genérico')).toBe('genérico');
		expect(mensagemDeErroDeDominio('string solta', 'genérico')).toBe('genérico');
	});

	it('expõe classe de domínio só quando declarada', () => {
		expect(mensagemDeErroDeDominio(new ErroDeCapacidade('Reduza as amostras.'), 'genérico')).toBe('genérico');
		expect(mensagemDeErroDeDominio(new ErroDeCapacidade('Reduza as amostras.'), 'genérico', [ErroDeCapacidade])).toBe(
			'Reduza as amostras.',
		);
	});
});
