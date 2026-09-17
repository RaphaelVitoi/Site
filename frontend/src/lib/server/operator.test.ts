/**
 * @jest-environment node
 */
import { isOperatorEmail, operatorEmails } from './operator';

jest.mock('server-only', () => ({}));

describe('identidade de operador (FE-04)', () => {
	const env = { NEXUS_OPERATOR_EMAILS: ' Raphael@Exemplo.com , outro@exemplo.com,,lixo' };

	it('lista vazia falha fechado', () => {
		expect(operatorEmails({}).size).toBe(0);
		expect(isOperatorEmail('raphael@exemplo.com', {})).toBe(false);
	});

	it('compara sem caixa e sem espaços, ignorando entradas sem @', () => {
		expect(operatorEmails(env)).toEqual(new Set(['raphael@exemplo.com', 'outro@exemplo.com']));
		expect(isOperatorEmail('RAPHAEL@exemplo.COM', env)).toBe(true);
	});

	it('qualquer outra conta não é operador', () => {
		expect(isOperatorEmail('aluno@gmail.com', env)).toBe(false);
		expect(isOperatorEmail(undefined, env)).toBe(false);
		expect(isOperatorEmail('lixo', env)).toBe(false);
	});
});
