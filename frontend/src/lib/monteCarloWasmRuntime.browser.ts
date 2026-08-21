import initWasm, {
	calculate_equity_monte_carlo_binary,
} from './engine/generated/vitoi_equity_engine';

export async function initializeMonteCarloWasm() {
	await initWasm();
	return calculate_equity_monte_carlo_binary;
}
