import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoginContent } from './LoginContent';

const signIn = jest.fn();
const getProviders = jest.fn();
let params = new URLSearchParams();
let sessao: unknown = null;

jest.mock('next-auth/react', () => ({
	signIn: (...args: unknown[]) => signIn(...args),
	getProviders: () => getProviders(),
	useSession: () => ({ data: sessao, status: sessao ? 'authenticated' : 'unauthenticated' }),
}));
jest.mock('next/navigation', () => ({ useSearchParams: () => params }));

describe('LoginContent (FE-01)', () => {
	beforeEach(() => {
		signIn.mockReset();
		getProviders.mockReset();
		params = new URLSearchParams();
		sessao = null;
	});

	it('sem provedor configurado, diz isso em vez de oferecer entrada falsa', async () => {
		getProviders.mockResolvedValue({});
		render(<LoginContent />);
		expect(await screen.findByRole('status')).toHaveTextContent('Nenhum provedor de login está configurado');
		expect(screen.queryByText(/Convidado/i)).toBeNull();
		expect(screen.queryByText(/Encryption/i)).toBeNull();
	});

	it('entra de verdade pelo provedor, voltando à rota pedida', async () => {
		params = new URLSearchParams({ callbackUrl: '/dashboard' });
		getProviders.mockResolvedValue({ google: { id: 'google', name: 'Google', type: 'oidc', signinUrl: '', callbackUrl: '' } });
		render(<LoginContent />);
		fireEvent.click(await screen.findByRole('button', { name: /Entrar com Google/ }));
		expect(signIn).toHaveBeenCalledWith('google', { redirectTo: '/dashboard' });
	});

	it('não aceita callback para fora da origem', async () => {
		params = new URLSearchParams({ callbackUrl: '//evil.example' });
		getProviders.mockResolvedValue({ google: { id: 'google', name: 'Google', type: 'oidc', signinUrl: '', callbackUrl: '' } });
		render(<LoginContent />);
		fireEvent.click(await screen.findByRole('button', { name: /Entrar com Google/ }));
		expect(signIn).toHaveBeenCalledWith('google', { redirectTo: '/' });
	});

	it('explica a restrição ao operador para conta autenticada', async () => {
		params = new URLSearchParams({ motivo: 'restrito' });
		sessao = { user: { email: 'aluno@gmail.com' } };
		getProviders.mockResolvedValue({});
		render(<LoginContent />);
		expect(await screen.findByRole('alert')).toHaveTextContent('restrita ao operador');
	});
});
