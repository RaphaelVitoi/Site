import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ToyGamesPage from '@/app/(public)/biblioteca/toy-games/page';

jest.mock('@/components/ui/layout/ContentPageHeader', () => ({
	ContentPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

jest.mock('@/components/ui/layout/GlassPanel', () => ({
	GlassPanel: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

jest.mock('@/components/ui/layout/SotaMarkdown', () => ({
	SotaMarkdown: ({ content }: { content: string }) => <pre>{content}</pre>,
}));

jest.mock('@/components/simulator/panels/PostFlopPanel', () => ({
	__esModule: true,
	default: () => <div data-testid="post-flop-panel" />,
}));

describe('Toy Games — contrato teórico público', () => {
	it('preserva a direção da Vantagem de Risco como assimetria ICMev/RP', () => {
		render(<ToyGamesPage />);

		expect(screen.getByText(/RP_\{defensor\} - RP_\{agressor\}/)).toBeInTheDocument();
		expect(screen.getByText(/menor RP/i)).toBeInTheDocument();
		expect(screen.getByText(/não é um conversor linear/i)).toBeInTheDocument();
	});
});
