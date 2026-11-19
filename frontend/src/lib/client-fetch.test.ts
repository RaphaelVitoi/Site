import {
	ClientFetchError,
	composeClientSignal,
	fetchBlob,
	fetchJson,
	fetchResponse,
	isAbortError,
} from './client-fetch';

describe('client-fetch resilience utilities', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	it('retorna payload JSON tipado com cache no-store', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			headers: new Headers({ 'x-request-id': 'req-123' }),
			json: async () => ({ status: 'ok', value: 42 }),
		} as Response);

		const data = await fetchJson<{ status: string; value: number }>('/api/v1/health');
		expect(data).toEqual({ status: 'ok', value: 42 });
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'/api/v1/health',
			expect.objectContaining({ cache: 'no-store' }),
		);
	});

	it('fetchResponse retorna Response integro para streams e fetchBlob retorna Blob binario', async () => {
		const mockBlob = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
		globalThis.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({ 'x-request-id': 'stream-1' }),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				blob: async () => mockBlob,
			} as unknown as Response);

		const response = await fetchResponse('/api/v1/gemma', { method: 'POST' });
		expect(response.ok).toBe(true);

		const blob = await fetchBlob('/api/sota/pmev-pdf', { method: 'POST' });
		expect(blob).toBe(mockBlob);
	});

	it('lanca ClientFetchError estruturado com status, mensagem do backend e X-Request-Id', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 504,
			headers: new Headers({ 'x-request-id': 'corr-timeout-9' }),
			json: async () => ({ status: 'ERROR', error: 'Gateway expirou' }),
		} as Response);

		await expect(fetchJson('/api/sota/timesfm-forecast')).rejects.toMatchObject({
			name: 'ClientFetchError',
			message: 'Gateway expirou',
			status: 504,
			requestId: 'corr-timeout-9',
		});
	});

	it('tolera stubs de teste minimos sem headers ou status', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true }),
		} as unknown as Response);

		await expect(fetchJson('/api/sota/key-pools')).resolves.toEqual({ ok: true });
	});

	it('usa fallbackError quando resposta de erro nao traz campo error', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 502,
			json: async () => ({}),
		} as unknown as Response);

		await expect(
			fetchJson('/api/v1/predictive', { fallbackError: 'Oraculo indisponivel' }),
		).rejects.toBeInstanceOf(ClientFetchError);
	});

	it('identifica AbortError e TimeoutError em isAbortError e propaga signal', () => {
		const abortErr = new Error('cancelled');
		abortErr.name = 'AbortError';
		const timeoutErr = new Error('timed out');
		timeoutErr.name = 'TimeoutError';
		const normalErr = new Error('network down');

		expect(isAbortError(abortErr)).toBe(true);
		expect(isAbortError(timeoutErr)).toBe(true);
		expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true);
		expect(isAbortError(new DOMException('Timeout', 'TimeoutError'))).toBe(true);
		expect(isAbortError(normalErr)).toBe(false);
		expect(isAbortError(null)).toBe(false);

		const controller = new AbortController();
		const composed = composeClientSignal(controller.signal, 5_000);
		expect(composed).toBeDefined();
	});
});
