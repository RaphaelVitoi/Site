import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DynamicArticlePage from '@/app/(public)/biblioteca/[slug]/page';

const mockUseSWR = jest.fn();

jest.mock('next/navigation', () => ({
	useParams: () => ({ slug: 'artigo-de-teste' }),
}));

jest.mock('swr', () => ({
	__esModule: true,
	default: () => mockUseSWR(),
}));

jest.mock('@/components/ui/layout/ContentPageHeader', () => ({
	ContentPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

jest.mock('@/components/ui/layout/SotaMarkdown', () => ({
	SotaMarkdown: ({ content }: { content: string }) => <div>{content}</div>,
}));

jest.mock('@/components/ui/layout/GlassPanel', () => ({
	GlassPanel: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

jest.mock('@/components/ui/layout/TableOfContents', () => ({
	__esModule: true,
	default: () => <nav aria-label="Índice de teste" />,
}));

jest.mock('@/components/ui/layout/ScrollToTop', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/ui/layout/ContentFooter', () => ({
	__esModule: true,
	default: () => <footer />,
}));

describe('Página dinâmica de biblioteca — status epistemológico', () => {
	beforeEach(() => {
		mockUseSWR.mockReturnValue({
			data: {
				title: 'Artigo de teste',
				description: 'Conteúdo de teste',
				category: 'Ensaio',
				body: '# Corpo',
			},
		});
	});

	it('não certifica conteúdo dinâmico como validado sem metadado de evidência', () => {
		render(<DynamicArticlePage />);

		expect(screen.getByText('Conteúdo dinâmico')).toBeInTheDocument();
		expect(screen.getByText('Contrato API v1')).toBeInTheDocument();
		expect(screen.queryByText('Validado')).not.toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Neste Artefato', level: 2 })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Metadados SOTA', level: 2 })).toBeInTheDocument();
	});

	it('distingue catálogo protegido de slug inexistente', () => {
		mockUseSWR.mockReturnValue({ error: Object.assign(new Error('Unauthorized'), { status: 401 }) });

		render(<DynamicArticlePage />);

		expect(screen.getByText(/sessão autorizada/i)).toBeInTheDocument();
		expect(screen.queryByText(/não existe na base de dados/i)).not.toBeInTheDocument();
	});
});
