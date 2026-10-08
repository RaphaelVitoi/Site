import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { CfrCanvas, type CfrCanvasRef } from '@/components/simulator/ui/CfrCanvas';

describe('CfrCanvas — Acessibilidade e Renderização 2D (WCAG 2.2 AA)', () => {
	beforeEach(() => {
		// Mock canvas getContext para ambiente jsdom
		HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
			save: jest.fn(),
			restore: jest.fn(),
			scale: jest.fn(),
			clearRect: jest.fn(),
			fillRect: jest.fn(),
			strokeRect: jest.fn(),
			fillText: jest.fn(),
			measureText: jest.fn().mockReturnValue({ width: 20 }),
		});
	});

	it('renderiza o canvas com role="img" e aria-label descritiva', () => {
		render(<CfrCanvas nodes={13} />);

		const canvas = screen.getByRole('img');
		expect(canvas).toBeInTheDocument();
		expect(canvas).toHaveAttribute(
			'aria-label',
			'Matriz CFR de Regret Matching 13x13. Dados acessíveis disponíveis na tabela estruturada.',
		);
	});

	it('renderiza tabela sr-only completa com 169 células estruturadas para leitores de tela', () => {
		render(<CfrCanvas nodes={13} />);

		const caption = screen.getByText(/Matriz CFR de Regret Matching 13x13/i);
		expect(caption).toBeInTheDocument();

		// Cabeçalhos de coluna acessíveis
		expect(screen.getByRole('columnheader', { name: 'Mão' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: 'Frequência de Ação' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: 'Frequência de Fold' })).toBeInTheDocument();

		// Linhas de mãos canônicas (AA, AKs, 22)
		expect(screen.getByRole('rowheader', { name: 'AA' })).toBeInTheDocument();
		expect(screen.getByRole('rowheader', { name: 'AKs' })).toBeInTheDocument();
		expect(screen.getByRole('rowheader', { name: '22' })).toBeInTheDocument();

		const rows = screen.getAllByRole('row');
		// 1 cabeçalho + 169 células = 170 linhas
		expect(rows).toHaveLength(170);
	});

	it('aceita atualização de matriz via imperative ref updateMatrix', () => {
		const ref = createRef<CfrCanvasRef>();
		render(<CfrCanvas ref={ref} nodes={13} />);

		expect(ref.current).toBeDefined();
		expect(typeof ref.current?.updateMatrix).toBe('function');

		const dummyMatrix = new Float32Array(169).fill(0.8);
		expect(() => ref.current?.updateMatrix(dummyMatrix)).not.toThrow();
	});
});
