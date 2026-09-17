import { render, screen, waitFor } from '@testing-library/react';

const renderMermaid = jest.fn();
const initialize = jest.fn();
let mermaidImportado = false;
jest.mock('mermaid', () => {
	mermaidImportado = true;
	return { __esModule: true, default: { initialize, render: (...a: unknown[]) => renderMermaid(...a) } };
});
jest.mock('react-markdown', () => ({
	__esModule: true,
	default: ({ children, components }: { children: string; components: { code: (p: object) => unknown } }) => {
		const bloco = /```mermaid\n([\s\S]*?)```/.exec(children);
		return bloco
			? (components.code({ className: 'language-mermaid', children: bloco[1] }) as JSX.Element)
			: <p>{children}</p>;
	},
}));
jest.mock('rehype-katex', () => () => undefined);
jest.mock('rehype-slug', () => () => undefined);
jest.mock('remark-gfm', () => () => undefined);
jest.mock('remark-math', () => () => undefined);
jest.mock('katex/dist/katex.min.css', () => ({}));

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

describe('SotaMarkdown — mermaid sob demanda (FE-09)', () => {
	it('não importa o mermaid numa página sem diagrama', () => {
		render(<SotaMarkdown content="Texto sem diagrama." />);
		expect(mermaidImportado).toBe(false);
	});

	it('renderiza o diagrama pelo SVG gerado, em modo strict, e re-renderiza quando o código muda', async () => {
		renderMermaid.mockImplementation(async (_id: string, code: string) => ({ svg: `<svg data-code="${code}"></svg>` }));
		const { container, rerender } = render(<SotaMarkdown content={'```mermaid\ngraph TD; A-->B\n```'} />);
		await waitFor(() => expect(container.querySelector('svg[data-code="graph TD; A-->B"]')).not.toBeNull());
		expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ securityLevel: 'strict' }));

		rerender(<SotaMarkdown content={'```mermaid\ngraph TD; C-->D\n```'} />);
		await waitFor(() => expect(container.querySelector('svg[data-code="graph TD; C-->D"]')).not.toBeNull());
		expect(screen.queryByText('graph TD; A-->B')).toBeNull();
	});
});
