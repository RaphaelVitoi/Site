/**
 * @jest-environment node
 */
type SignIn = (params: { account?: { provider: string } | null; profile?: unknown }) => boolean;

const capturado: { signIn?: SignIn | undefined } = {};

jest.mock('server-only', () => ({}));
jest.mock('next-auth/providers/discord', () => ({ __esModule: true, default: { id: 'discord' } }));
jest.mock('next-auth/providers/google', () => ({ __esModule: true, default: { id: 'google' } }));
jest.mock('next-auth/providers/credentials', () => ({ __esModule: true, default: jest.fn(() => ({ id: 'dev-operator' })) }));
jest.mock('next-auth', () => ({
	__esModule: true,
	default: (config: { callbacks?: { signIn?: SignIn } }) => {
		capturado.signIn = config.callbacks?.signIn;
		return { handlers: {}, signIn: jest.fn(), signOut: jest.fn(), auth: jest.fn() };
	},
}));

describe('auth.ts recusa e-mail não verificado', () => {
	beforeAll(async () => {
		process.env['AUTH_SECRET'] = 'segredo-de-teste-com-mais-de-32-caracteres';
		await import('@/auth');
	});

	it('registra o callback signIn', () => {
		expect(typeof capturado.signIn).toBe('function');
	});

	it('Discord com e-mail do operador sem verificação não entra', () => {
		expect(capturado.signIn?.({ account: { provider: 'discord' }, profile: { email: 'op@x.com', verified: false } })).toBe(false);
	});

	it('Discord e Google verificados entram', () => {
		expect(capturado.signIn?.({ account: { provider: 'discord' }, profile: { verified: true } })).toBe(true);
		expect(capturado.signIn?.({ account: { provider: 'google' }, profile: { email_verified: true } })).toBe(true);
	});
});
