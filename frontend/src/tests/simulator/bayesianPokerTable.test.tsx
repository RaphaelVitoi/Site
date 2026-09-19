import { fireEvent, render, screen } from '@testing-library/react';
import { BayesianPokerTable } from '../../components/simulator/ui/BayesianPokerTable';
import { PlayingCard } from '../../components/simulator/ui/PlayingCard';
import BayesianBeliefPanel from '../../components/simulator/panels/BayesianBeliefPanel';

describe('PlayingCard', () => {
	it('renders card rank and suit symbol with correct accessibility label', () => {
		render(<PlayingCard card="Ah" />);
		const card = screen.getByLabelText('A de Copas');
		expect(card).toBeInTheDocument();
		expect(card).toHaveTextContent('A');
		expect(card).toHaveTextContent('♥');
	});

	it('renders facedown card with hidden state', () => {
		render(<PlayingCard card="Kd" isFacedown={true} />);
		expect(screen.getByLabelText('Carta oculta')).toBeInTheDocument();
	});

	it('renders custom sizes and highlights', () => {
		const { container } = render(<PlayingCard card="2c" size="xs" highlight={true} />);
		expect(container.firstChild).toHaveClass('w-7.5');
		expect(container.firstChild).toHaveClass('ring-emerald-500');
	});
});

describe('BayesianPokerTable', () => {
	it('renders 6-max table seats with Hero and Villain badges', () => {
		const onSelectBoardTexture = jest.fn();
		const onSelectVillainPosition = jest.fn();
		const onSelectHeroPosition = jest.fn();

		render(
			<BayesianPokerTable
				boardTexture="dry"
				onSelectBoardTexture={onSelectBoardTexture}
				streetStep={0}
				heroPosition="BTN"
				villainPosition="BB"
				onSelectBoardTexture={onSelectBoardTexture}
				onSelectVillainPosition={onSelectVillainPosition}
				onSelectHeroPosition={onSelectHeroPosition}
				currentPot={15.0}
			/>,
		);

		// Verifica assentos
		expect(screen.getByText('(Hero)')).toBeInTheDocument();
		expect(screen.getByText('(Vilão)')).toBeInTheDocument();
		expect(screen.getByText('D')).toBeInTheDocument(); // Dealer button

		// Verifica Pote
		expect(screen.getByText('15.0 BB')).toBeInTheDocument();

		// Verifica Cartas do Flop (Bordo Seco: Ah Kd 2c) na mesa e miniaturas
		expect(screen.getAllByLabelText('A de Copas').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByLabelText('K de Ouros').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByLabelText('2 de Paus').length).toBeGreaterThanOrEqual(1);
	});

	it('allows clicking on board textures to trigger update', () => {
		const onSelectBoardTexture = jest.fn();
		render(
			<BayesianPokerTable
				boardTexture="dry"
				onSelectBoardTexture={onSelectBoardTexture}
				streetStep={0}
			/>,
		);

		const wetBoardBtn = screen.getByText('Bordo Molhado');
		fireEvent.click(wetBoardBtn);
		expect(onSelectBoardTexture).toHaveBeenCalledWith('wet');
	});

	it('allows selecting a new villain position', () => {
		const onSelectVillain = jest.fn();
		render(
			<BayesianPokerTable
				boardTexture="dry"
				onSelectBoardTexture={jest.fn()}
				heroPosition="BTN"
				villainPosition="BB"
				onSelectVillainPosition={onSelectVillain}
			/>,
		);

		// Clica no assento CO (não-hero)
		const coSeat = screen.getByTitle(/Cutoff/);
		fireEvent.click(coSeat);
		expect(onSelectVillain).toHaveBeenCalledWith('CO');
	});
});

describe('BayesianBeliefPanel Integration', () => {
	it('renders default Flop C-Bet state with ATIVO indicator and cohesive grid header for Aula 1.2', () => {
		render(<BayesianBeliefPanel />);

		// Verifica telemetria PBS
		expect(screen.getByText(/Public Belief State/i)).toBeInTheDocument();
		expect(screen.getAllByText(/Flop Ativo/i).length).toBeGreaterThanOrEqual(1);

		// Verifica botão default ativo
		expect(screen.getByText('Flop C-Bet (33% Pot)')).toBeInTheDocument();
		expect(screen.getByText('ATIVO')).toBeInTheDocument();

		// Verifica seletor de modelo ICMev vs ChipEV e o princípio doutrinário
		expect(screen.getByText(/Ambiente de Decisão · Aula 1.2/i)).toBeInTheDocument();
		expect(screen.getByText(/ICMev \(HRC · Aula 1.2\)/i)).toBeInTheDocument();
		expect(screen.getByText(/ChipEV \(GTO Wizard\)/i)).toBeInTheDocument();

		// Verifica Risk Advantage no header da mesa
		expect(screen.getByText(/Risk Advantage: \+8.5% \(BU 21.4% vs BB 12.9%\)/i)).toBeInTheDocument();

		// Verifica ícone do Turn Barrel (fa-fire-flame-curved)
		expect(screen.getByText('Turn Barrel (66% Pot)')).toBeInTheDocument();
		expect(screen.getByText('Alta Densidade')).toBeInTheDocument();

		// Verifica título do Grid sincronizado com a ação e Aula 1.2
		expect(screen.getByText(/Flop C-Bet \(33% Pot\) · Aula 1.2/i)).toBeInTheDocument();
		expect(screen.getByText(/Freq: Seletiva \(~75.0%\)/i)).toBeInTheDocument();
	});

	it('activates Turn Barrel, switches street to Turn and updates strategy explanation', () => {
		render(<BayesianBeliefPanel />);

		const turnBarrelBtn = screen.getByRole('button', { name: /Turn Barrel \(66% Pot\)/i });
		fireEvent.click(turnBarrelBtn);

		// O botão Turn Barrel agora deve ter o badge ATIVO
		expect(turnBarrelBtn).toHaveTextContent('ATIVO');
		expect(screen.getAllByText(/Turn Ativo/i).length).toBeGreaterThanOrEqual(1);

		// Cabeçalho do grid deve sincronizar com Turn Barrel
		expect(screen.getByText(/Turn Barrel \(66% Pot\) · Aula 1.2/i)).toBeInTheDocument();
		expect(screen.getByText(/Freq: Polarizada \(~42.8%\)/i)).toBeInTheDocument();
	});

	it('activates River Shove Polarizado and advances street to River', () => {
		render(<BayesianBeliefPanel />);

		const riverShoveBtn = screen.getByRole('button', { name: /River Shove Polarizado/i });
		fireEvent.click(riverShoveBtn);

		expect(riverShoveBtn).toHaveTextContent('ATIVO');
		expect(screen.getAllByText(/River Ativo/i).length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText(/River Shove Polarizado · Aula 1.2/i)).toBeInTheDocument();
	});

	it('toggles between ICMev and ChipEV models updating tactical frequency and explanation', () => {
		render(<BayesianBeliefPanel />);

		// Inicialmente em ICMev: Seletiva (~75.0%)
		expect(screen.getByText(/Freq: Seletiva \(~75.0%\)/i)).toBeInTheDocument();

		// Clica em ChipEV
		const chipevBtn = screen.getByRole('button', { name: /ChipEV \(GTO Wizard\)/i });
		fireEvent.click(chipevBtn);

		// Em ChipEV: Quase Puro (~97.7%)
		expect(screen.getByText(/Freq: Quase Puro \(~97.7%\)/i)).toBeInTheDocument();
		expect(screen.getByText(/50% Pot Dominante \(82.5%\)/i)).toBeInTheDocument();

		// Volta para ICMev
		const icmBtn = screen.getByRole('button', { name: /ICMev \(HRC · Aula 1.2\)/i });
		fireEvent.click(icmBtn);
		expect(screen.getByText(/Freq: Seletiva \(~75.0%\)/i)).toBeInTheDocument();
	});

	it('synchronizes range strategy dynamically when board texture changes', () => {
		render(<BayesianBeliefPanel />);

		// Clica em Bordo Molhado no seletor da mesa
		const wetBoardBtn = screen.getByText('Bordo Molhado');
		fireEvent.click(wetBoardBtn);

		// O cabeçalho do grid deve atualizar imediatamente para Bordo Molhado
		expect(screen.getByText(/Flop C-Bet \(33% Pot\) · Bordo Molhado/i)).toBeInTheDocument();
		expect(screen.getByText(/Freq: Seletiva \(~44%\)/i)).toBeInTheDocument();
		expect(screen.getByText(/Leitura Teórica do Range:/i)).toBeInTheDocument();
	});

	it('supports undo and reset belief distribution', () => {
		render(<BayesianBeliefPanel />);

		// Seleciona Check-Raise
		const checkRaiseBtn = screen.getByRole('button', { name: /Check-Raise Flop/i });
		fireEvent.click(checkRaiseBtn);
		expect(checkRaiseBtn).toHaveTextContent('ATIVO');

		// Desfazer
		const undoBtns = screen.getAllByRole('button', { name: /Desfazer/i });
		fireEvent.click(undoBtns[0]);
		expect(screen.getByRole('button', { name: /Flop C-Bet/i })).toHaveTextContent('ATIVO');

		// Resetar
		const resetBtn = screen.getByRole('button', { name: /Resetar Range/i });
		fireEvent.click(resetBtn);
		// Sem ação ativa específica, todos os botões voltam aos seus badges normais
		expect(screen.queryByText('ATIVO')).not.toBeInTheDocument();
	});
});
