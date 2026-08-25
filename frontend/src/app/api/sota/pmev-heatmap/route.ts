import { NextResponse } from 'next/server';

/**
 * IDENTITY: SOTA PMev Range Heatmap Proxy API
 * PATH: src/app/api/sota/pmev-heatmap/route.ts
 * ROLE: Encaminha calculos de matriz de range comparativa ao micro-servidor SOTA Python.
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

		const resp = await fetch(`${backendUrl}/api/v1/pmev/heatmap`, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
			cache: 'no-store',
		});

		if (!resp.ok) {
			const errData = await resp.json().catch(() => ({ error: 'Backend error' }));
			return NextResponse.json(errData, { status: resp.status });
		}

		const data = await resp.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				status: 'ERROR',
				error: error instanceof Error ? error.message : 'Unknown PMev Heatmap Error',
			},
			{ status: 500 }
		);
	}
}
