import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AppError from '@/app/error';
import GlobalError from '@/app/global-error';
import NotFound from '@/app/not-found';
import * as telemetry from '@/lib/telemetry-client';

jest.mock('@/lib/telemetry-client', () => ({
	logTelemetryEvent: jest.fn(),
}));

jest.mock('next/link', () => {
	const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
		return <a href={href}>{children}</a>;
	};
	MockLink.displayName = 'MockLink';
	return MockLink;
});

describe('Frontend Resilience & Error Boundaries', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('AppError renderiza interface de contingencia e aciona reset', () => {
		const resetMock = jest.fn();
		const testError = new Error('Falha de simulacao de teste') as Error & { digest?: string };
		testError.digest = 'ERR_TEST_1234';

		render(<AppError error={testError} reset={resetMock} />);

		expect(screen.getByText('Interrupção no Fluxo de Execução')).toBeInTheDocument();
		expect(screen.getByText('Digest ID: ERR_TEST_1234')).toBeInTheDocument();
		expect(telemetry.logTelemetryEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				category: 'error',
				componentName: 'AppRouterErrorBoundary',
			})
		);

		const retryBtn = screen.getByRole('button', { name: /Recalibrar Execução/i });
		fireEvent.click(retryBtn);
		expect(resetMock).toHaveBeenCalledTimes(1);

		const homeLink = screen.getByRole('link', { name: /Retornar ao Início/i });
		expect(homeLink).toHaveAttribute('href', '/');
	});

	it('GlobalError renderiza interface raiz emergencial e aciona reset', () => {
		const resetMock = jest.fn();
		const testError = new Error('Falha fatal de raiz') as Error & { digest?: string };
		testError.digest = 'ROOT_FATAL_999';

		render(<GlobalError error={testError} reset={resetMock} />);

		expect(screen.getByText('Falha Crítica no Kernel')).toBeInTheDocument();
		expect(screen.getByText('Ref: ROOT_FATAL_999')).toBeInTheDocument();
		expect(telemetry.logTelemetryEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				category: 'error',
				componentName: 'GlobalRootErrorBoundary',
			})
		);

		const restartBtn = screen.getByRole('button', { name: /Reiniciar Aplicação/i });
		fireEvent.click(restartBtn);
		expect(resetMock).toHaveBeenCalledTimes(1);
	});

	it('NotFound renderiza tela de 404 e links semanticos', () => {
		render(<NotFound />);

		expect(screen.getByText('404')).toBeInTheDocument();
		expect(screen.getByText('Território Fora do Grafo')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /Página Principal/i })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: /Simulador SOTA/i })).toHaveAttribute('href', '/simulador');
	});
});
