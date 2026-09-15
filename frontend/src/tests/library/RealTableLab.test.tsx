import { fireEvent, render, screen } from '@testing-library/react';
import RealTableLab from '@/components/pmev/benchmark/RealTableLab';
import type { BenchmarkStructure } from '@/lib/pmevBenchmark';

const metrica = { modelo: 0, referencia: 0, diferenca: 0, ic95: [0, 0] as [number, number] };

const estrutura: BenchmarkStructure = {
	id: 'teste',
	rotulo: 'STT 3 jogadores, 2 pagos',
	field: 3,
	max_mesa: 3,
	stack_inicial: 1000,
	canonicos: 1,
	fracoes_premio: [0.65, 0.35],
	prize_pool_referencia: 3,
	vencedor_leva_tudo: false,
	estados: 2,
	torneios: 1,
	metricas: { brier_lugar: metrica, logloss_lugar: metrica, brier_itm: metrica, erro2_premio: metrica },
	calibracao_itm: [],
	calibracao_vitoria: [],
	concavidade: [],
	por_jogadores_vivos: [],
	amostras: [
		{
			nivel: 1,
			blinds: { sb: 10, bb: 20, ante: 0 },
			stacks: [2000, 1000],
			heroi: 0,
			lugar_final: 2,
			premios: [1.95, 1.05],
			icm_ev: [1.65, 1.35],
			chip_ev: [2, 1],
		},
		{
			nivel: 1,
			blinds: { sb: 10, bb: 20, ante: 0 },
			stacks: [1500, 900, 600],
			heroi: 1,
			lugar_final: 1,
			premios: [1.95, 1.05],
			icm_ev: [1.2, 0.99, 0.81],
			chip_ev: [1.5, 0.9, 0.6],
		},
	],
};

describe('Laboratório de mesa real', () => {
	it('esconde o desfecho até o leitor pedir', () => {
		render(<RealTableLab structures={[estrutura]} />);
		expect(screen.queryByText(/Terminou em/)).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'Mostrar como terminou' }));
		expect(screen.getByText(/Terminou em 2º, com US\$ 1,05\. O ICM dava 33,3% para esse lugar\./)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Mostrar como terminou' })).toBeDisabled();
	});

	it('trocar de mesa volta a esconder o desfecho e mostra o novo estado', () => {
		render(<RealTableLab structures={[estrutura]} />);
		fireEvent.click(screen.getByRole('button', { name: 'Mostrar como terminou' }));
		fireEvent.click(screen.getByRole('button', { name: 'Ver outra mesa real' }));
		expect(screen.queryByText(/Terminou em/)).toBeNull();
		expect(screen.getByText(/3 jogadores vivos/)).toBeInTheDocument();
		expect(screen.getAllByRole('row')).toHaveLength(4);
	});
});
