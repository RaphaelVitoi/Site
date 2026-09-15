/**
 * @jest-environment node
 */
import { POST as timesfmPost } from '@/app/api/sota/timesfm-forecast/route';
import { POST as heatmapPost } from '@/app/api/sota/pmev-heatmap/route';

describe('SOTA API Proxy Routes (Node Environment)', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('timesfm-forecast proxy encaminha requisicao ao backend SOTA e propaga resposta', async () => {
		const mockResponseData = { status: 'SUCCESS', forecast: [100.5, 102.3, 104.1] };
		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve(mockResponseData),
		});

		const req = new Request('http://localhost:3000/api/sota/timesfm-forecast', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ series: [10, 20, 30] }),
		});

		const res = await timesfmPost(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(mockResponseData);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/timesfm/forecast'),
			expect.objectContaining({
				method: 'POST',
				cache: 'no-store',
			})
		);
	});

	it('pmev-heatmap proxy encaminha requisicao ao backend SOTA e propaga resposta', async () => {
		const mockResponseData = { status: 'SUCCESS', heatmap: [[0.1, 0.2], [0.3, 0.4]] };
		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve(mockResponseData),
		});

		const req = new Request('http://localhost:3000/api/sota/pmev-heatmap', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ matrix_type: 'nash_equilibrium' }),
		});

		const res = await heatmapPost(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(mockResponseData);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/pmev/heatmap'),
			expect.objectContaining({
				method: 'POST',
				cache: 'no-store',
			})
		);
	});

	it('trata falha de conexao com status 500 estruturado', async () => {
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

		const req = new Request('http://localhost:3000/api/sota/timesfm-forecast', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ series: [1] }),
		});

		const res = await timesfmPost(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data).toEqual({
			status: 'ERROR',
			error: 'ECONNREFUSED',
		});
	});
});
