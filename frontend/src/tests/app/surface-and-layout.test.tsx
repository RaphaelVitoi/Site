import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { isLightPage, isReadingContentPage, LIGHT_EDITORIAL_ROUTES } from '@/lib/surface';
import { ROUTES } from '@/constants/routes';
import { ReadingProgressBar } from '@/components/ui/layout/ReadingProgressBar';

jest.mock('framer-motion', () => ({
	motion: {
		div: ({ className, style, children }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) => (
			<div data-testid="motion-progress" className={className} style={style}>
				{children}
			</div>
		),
	},
	useScroll: () => ({ scrollYProgress: { get: () => 0.5 } }),
	useSpring: (val: unknown) => val,
}));

describe('Arquitetura de Superfícies & Layout (SOTA)', () => {
	describe('isLightPage', () => {
		it('identifica corretamente superfícies editoriais claras', () => {
			expect(isLightPage('/')).toBe(true);
			expect(isLightPage('/quem-sou')).toBe(true);
			expect(LIGHT_EDITORIAL_ROUTES).toContain('/');
			expect(LIGHT_EDITORIAL_ROUTES).toContain('/quem-sou');
		});

		it('identifica corretamente superfícies de laboratório e simuladores (dark)', () => {
			expect(isLightPage('/simulador')).toBe(false);
			expect(isLightPage('/simulador/distorcoes')).toBe(false);
			expect(isLightPage('/simulador/gto-cfr')).toBe(false);
			expect(isLightPage('/templo')).toBe(false);
			expect(isLightPage('/templo/analytics')).toBe(false);
			expect(isLightPage('/dashboard')).toBe(false);
			expect(isLightPage('/biblioteca')).toBe(false);
			expect(isLightPage('/login')).toBe(false);
			expect(isLightPage('')).toBe(false);
			expect(isLightPage(null)).toBe(false);
			expect(isLightPage(undefined)).toBe(false);
		});
	});

	describe('isReadingContentPage', () => {
		it('identifica páginas de leitura de artigos e aulas', () => {
			expect(isReadingContentPage('/biblioteca/downward-drift-sota')).toBe(true);
			expect(isReadingContentPage('/aulas/icm-masterclass')).toBe(true);
		});

		it('retorna false para páginas não-artigo', () => {
			expect(isReadingContentPage('/')).toBe(false);
			expect(isReadingContentPage('/simulador')).toBe(false);
			expect(isReadingContentPage('/templo')).toBe(false);
			expect(isReadingContentPage('/login')).toBe(false);
			expect(isReadingContentPage(null)).toBe(false);
			expect(isReadingContentPage(undefined)).toBe(false);
		});
	});

	describe('Registro Canônico de Rotas (ROUTES)', () => {
		it('contém referências canônicas para autenticação e templo', () => {
			expect(ROUTES.AUTH.LOGIN).toBe('/login');
			expect(ROUTES.TEMPLO.INDEX).toBe('/templo');
			expect(ROUTES.TEMPLO.ANALYTICS).toBe('/templo/analytics');
			expect(ROUTES.TEMPLO.GEMMA).toBe('/templo/gemma');
			expect(ROUTES.TEMPLO.LAYA).toBe('/templo/laya');
		});
	});

	describe('ReadingProgressBar', () => {
		it('renderiza com atributos acessíveis e sem bloquear eventos de ponteiro', () => {
			const { container } = render(<ReadingProgressBar />);
			const wrapper = container.querySelector('[aria-hidden="true"]');
			expect(wrapper).toBeInTheDocument();
			expect(wrapper).toHaveClass('pointer-events-none');
			expect(wrapper).toHaveClass('fixed');

			const progressDiv = container.querySelector('[data-testid="motion-progress"]');
			expect(progressDiv).toBeInTheDocument();
			expect(progressDiv).toHaveClass('origin-left');
		});
	});
});
