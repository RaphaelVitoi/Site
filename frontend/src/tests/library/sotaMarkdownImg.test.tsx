import React, { type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('mermaid', () => ({
	__esModule: true,
	default: { initialize: jest.fn(), render: jest.fn() },
}));
jest.mock('react-markdown', () => ({
	__esModule: true,
	default: ({
		children,
		components,
	}: {
		children: string;
		components: { img?: (props: Record<string, unknown>) => ReactElement };
	}) => {
		const match = /!\[(.*?)\]\((.*?)\)/.exec(children);
		if (match && components.img) {
			return components.img({ alt: match[1], src: match[2] });
		}
		return <div>{children}</div>;
	},
}));
jest.mock('rehype-katex', () => () => undefined);
jest.mock('rehype-slug', () => () => undefined);
jest.mock('remark-gfm', () => () => undefined);
jest.mock('remark-math', () => () => undefined);
jest.mock('katex/dist/katex.min.css', () => ({}));

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

describe('SotaMarkdown — Blindagem de CLS em Imagens', () => {
	it('resolve aspect-ratio a partir da sintaxe alt com pipe e formato proporção (16:9)', () => {
		render(<SotaMarkdown content="![Diagrama Arquitetural|16:9](https://example.com/arch.png)" />);

		const img = screen.getByRole('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('alt', 'Diagrama Arquitetural');
		expect(img).toHaveAttribute('src', 'https://example.com/arch.png');
		expect(img).toHaveAttribute('width', '16');
		expect(img).toHaveAttribute('height', '9');
		expect(img).toHaveStyle({ aspectRatio: '16 / 9' });
	});

	it('resolve aspect-ratio com espaçamentos flexíveis e dimensões em pixels (800x600)', () => {
		render(<SotaMarkdown content="![Heatmap CFR | 800x600](https://example.com/cfr.png)" />);

		const img = screen.getByRole('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('alt', 'Heatmap CFR');
		expect(img).toHaveAttribute('width', '800');
		expect(img).toHaveAttribute('height', '600');
		expect(img).toHaveStyle({ aspectRatio: '800 / 600' });
	});

	it('renderiza imagem padrão sem aspecto forçado quando não há sintaxe de dimensão', () => {
		render(<SotaMarkdown content="![Foto Padrão](https://example.com/foto.png)" />);

		const img = screen.getByRole('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('alt', 'Foto Padrão');
		expect(img).not.toHaveAttribute('width');
		expect(img).not.toHaveAttribute('height');
	});
});
