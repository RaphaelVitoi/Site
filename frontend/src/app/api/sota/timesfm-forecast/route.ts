import { NextResponse } from 'next/server';

/**
 * IDENTITY: SOTA TimesFM Time-Series Forecasting Proxy API
 * PATH: src/app/api/sota/timesfm-forecast/route.ts
 * ROLE: Encaminha previsões estocásticas de séries temporais ao micro-servidor SOTA Python via TimesFM.
 */

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const backendUrl = process.env['BACKEND_API_URL'] || 'http://127.0.0.1:17042';
		const apiSecret = process.env['API_SECRET_TOKEN'] || 'sota-v6-dummy-secret';

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};
		if (apiSecret) {
			headers['Authorization'] = `Bearer ${apiSecret}`;
		}

		const resp = await fetch(`${backendUrl}/api/v1/timesfm/forecast`, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
			cache: 'no-store',
		});

		if (!resp.ok) {
			const errData = await resp.json().catch(() => ({ error: 'TimesFM Backend error' }));
			return NextResponse.json(errData, { status: resp.status });
		}

		const data = await resp.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				status: 'ERROR',
				error: error instanceof Error ? error.message : 'Unknown TimesFM Forecast Error',
			},
			{ status: 500 }
		);
	}
}
