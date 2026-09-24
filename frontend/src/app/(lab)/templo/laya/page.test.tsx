import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LayaSolverBridgePage from './page';

describe('LayaSolverBridgePage (Painel Visual Admin/Dev)', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('renderiza o cabeçalho, status strip e abas de navegação', () => {
		render(<LayaSolverBridgePage />);

		expect(screen.getByRole('heading', { level: 1, name: /Laya Multilingual S1 — Solver Bridge/i })).toBeInTheDocument();
		expect(screen.getByText(/multilingual \(322M\)/i)).toBeInTheDocument();
		expect(screen.getByText('Workbench Interativo')).toBeInTheDocument();
		expect(screen.getByText('Telemetria de Homologação')).toBeInTheDocument();
		expect(screen.getByText('Deploy & Microserviço GPU')).toBeInTheDocument();
	});

	it('permite alternar entre solvers analíticos', () => {
		render(<LayaSolverBridgePage />);

		const mcBtn = screen.getByText('Monte Carlo Insolvency (WASM)');
		fireEvent.click(mcBtn);

		expect(screen.getByText(/Expansão dinâmica de amostragem/i)).toBeInTheDocument();
	});

	it('executa a modulação S1 via /api/sota/laya/solve e renderiza os mostradores RLCD', async () => {
		const mockResponse = {
			status: 'SUCCESS',
			bridge_result: {
				target_solver: 'cfr-plus',
				adapted_parameters: {
					iterations: 3000,
					discount_alpha: 0.84,
				},
				s1_prediction: {
					answers: {},
					model_used: 'multilingual',
					device: 'edge-runtime-ts',
					n_tokens: 25,
					latency_ms: 1.15,
					noul: 0.2,
					choice: 'complex',
					score: 0.85,
					confidence: 0.8,
					provenia: {
						engine_id: 'laya-s1-predict-ts-simulation',
						implementation_level: 'simulation',
						runtime_used: 'nextjs-typescript',
						model_used: 'convaiinnovations/laya-multilingual',
						intended_model: 'multilingual',
						weights_loaded: false,
						fallback_used: true,
						assumptions: [],
						limitations: [],
						units: [],
					},
				},
				ruin_priority: 1.24,
				framework_signals: {
					cfr_regret_matching_plus: true,
					cfr_discount_alpha: 0.84,
				},
				provenia: {
					engine_id: 'laya-solver-adapter-cfr-plus-ts',
					implementation_level: 'simulation',
					runtime_used: 'nextjs-typescript',
					model_used: 'multilingual',
					intended_model: 'multilingual',
					weights_loaded: false,
					fallback_used: true,
					assumptions: ['solver-adapted=cfr-plus'],
					limitations: [],
					units: ['ruin_priority'],
				},
			},
		};

		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response);

		render(<LayaSolverBridgePage />);

		const execBtn = screen.getByRole('button', { name: /Executar Modulação/i });
		fireEvent.click(execBtn);

		await waitFor(() => {
			expect(screen.getByText('Sinais Neurais System-1 (RLCD Calibrated)')).toBeInTheDocument();
		});

		expect(screen.getByText('0.2000')).toBeInTheDocument(); // Noul
		expect(screen.getByText('complex')).toBeInTheDocument(); // Choice
		expect(screen.getByText('0.850')).toBeInTheDocument(); // Score
		expect(screen.getByText('1.240x')).toBeInTheDocument(); // Ruin Priority
		expect(screen.getByText('3000')).toBeInTheDocument(); // Modulated iterations
	});

	it('alterna para as abas de Telemetria e Deploy', () => {
		render(<LayaSolverBridgePage />);

		// Aba Telemetria
		fireEvent.click(screen.getByText('Telemetria de Homologação'));
		expect(screen.getByText('Benchmarks Medidos de Homologação (Local vs GPU Target)')).toBeInTheDocument();
		expect(screen.getByText('28.74 s')).toBeInTheDocument();

		// Aba Deploy
		fireEvent.click(screen.getByText('Deploy & Microserviço GPU'));
		expect(screen.getByText('Comandos de Deploy e Microserviço GPU')).toBeInTheDocument();
		expect(screen.getByText(/nexus-sota\/laya-multilingual-gpu/i)).toBeInTheDocument();
	});
});
