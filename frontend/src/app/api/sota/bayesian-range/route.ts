import { NextResponse } from 'next/server';

/**
 * IDENTITY: SOTA Bayesian Range Inference API
 * PATH: src/app/api/sota/bayesian-range/route.ts
 * ROLE: Processa atualização Bayesiana P(Win | Action) em tempo real.
 */

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const prior_equity = Math.max(0.01, Math.min(0.99, Number(body.prior_equity ?? 0.5)));
		const action_strength = Math.max(0.01, Math.min(0.99, Number(body.action_strength ?? 0.5)));
		const range_density = Math.max(0.01, Math.min(1.0, Number(body.range_density ?? 0.5)));
		const pot_odd_pressure = Math.max(0.0, Math.min(1.0, Number(body.pot_odd_pressure ?? 0.3)));

		// P(Action | Win) vs P(Action | Loss)
		const p_action_given_win = 1 - (1 - action_strength) * (1 - range_density * 0.5);
		const p_action_given_loss = action_strength * Math.max(0.1, 1 - pot_odd_pressure);

		const numerator = p_action_given_win * prior_equity;
		const denominator = numerator + p_action_given_loss * (1 - prior_equity);
		const posterior_win_prob = denominator > 0 ? numerator / denominator : prior_equity;

		return NextResponse.json({
			success: true,
			prior_equity,
			posterior_win_prob: Number(posterior_win_prob.toFixed(4)),
			p_action_given_win: Number(p_action_given_win.toFixed(4)),
			p_action_given_loss: Number(p_action_given_loss.toFixed(4)),
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown Bayesian error',
				posterior_win_prob: 0.5,
			},
			{ status: 500 }
		);
	}
}
