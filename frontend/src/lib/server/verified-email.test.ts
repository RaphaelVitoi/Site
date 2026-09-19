/**
 * @jest-environment node
 */
import { emailVerificadoPeloProvedor } from './verified-email';

describe('emailVerificadoPeloProvedor', () => {
	it('Discord exige verified === true', () => {
		expect(emailVerificadoPeloProvedor('discord', { email: 'op@x.com', verified: true })).toBe(true);
		expect(emailVerificadoPeloProvedor('discord', { email: 'op@x.com', verified: false })).toBe(false);
		expect(emailVerificadoPeloProvedor('discord', { email: 'op@x.com' })).toBe(false);
	});

	it('Google exige email_verified === true, não um valor apenas verdadeiro', () => {
		expect(emailVerificadoPeloProvedor('google', { email_verified: true })).toBe(true);
		expect(emailVerificadoPeloProvedor('google', { email_verified: 'true' })).toBe(false);
		expect(emailVerificadoPeloProvedor('google', {})).toBe(false);
	});

	it('provedor desconhecido ou perfil ausente falha fechado', () => {
		expect(emailVerificadoPeloProvedor('github', { verified: true, email_verified: true })).toBe(false);
		expect(emailVerificadoPeloProvedor(undefined, { verified: true })).toBe(false);
		expect(emailVerificadoPeloProvedor('discord', undefined)).toBe(false);
	});
});
