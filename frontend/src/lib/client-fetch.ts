/**
 * IDENTITY: Resiliência de Fetch Client-Side (SOTA)
 * PATH: src/lib/client-fetch.ts
 * ROLE: Timeout composto, aborto propagado, normalização de erros HTTP e rastreio X-Request-Id.
 */

export class ClientFetchError extends Error {
	readonly status: number;
	readonly payload: unknown;
	readonly requestId: string | null;

	constructor(
		message: string,
		options: {
			status: number;
			payload?: unknown;
			requestId?: string | null;
			cause?: unknown;
		},
	) {
		super(message, { cause: options.cause });
		this.name = 'ClientFetchError';
		this.status = options.status;
		this.payload = options.payload;
		this.requestId = options.requestId ?? null;
	}
}

export interface FetchJsonOptions extends RequestInit {
	timeoutMs?: number;
	fallbackError?: string;
}

export function isAbortError(error: unknown): boolean {
	if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
		return error.name === 'AbortError' || error.name === 'TimeoutError';
	}
	if (error instanceof Error) {
		return error.name === 'AbortError' || error.name === 'TimeoutError';
	}
	return false;
}

export function composeClientSignal(
	userSignal?: AbortSignal | null,
	timeoutMs?: number,
): AbortSignal | undefined {
	const hasTimeout =
		typeof timeoutMs === 'number' &&
		Number.isFinite(timeoutMs) &&
		timeoutMs > 0 &&
		typeof AbortSignal !== 'undefined' &&
		typeof AbortSignal.timeout === 'function';

	if (!hasTimeout) {
		return userSignal ?? undefined;
	}

	const timeoutSignal = AbortSignal.timeout(timeoutMs);
	if (userSignal && typeof AbortSignal.any === 'function') {
		return AbortSignal.any([userSignal, timeoutSignal]);
	}
	return userSignal ?? timeoutSignal;
}

function extractErrorMessage(payload: unknown): string | null {
	if (typeof payload !== 'object' || payload === null) return null;
	const candidate = (payload as { error?: unknown }).error;
	return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : null;
}

export async function fetchResponse(
	url: string,
	options: FetchJsonOptions = {},
): Promise<Response> {
	const { timeoutMs = 15_000, fallbackError, signal, ...init } = options;
	const composedSignal = composeClientSignal(signal, timeoutMs);

	const res = await fetch(url, {
		cache: 'no-store',
		...init,
		...(composedSignal ? { signal: composedSignal } : {}),
	});

	if (!res.ok) {
		const requestId = res.headers?.get?.('x-request-id') ?? null;
		const status = typeof res.status === 'number' ? res.status : 500;
		const payload: unknown =
			typeof res.json === 'function' ? await res.json().catch(() => null) : null;
		const message =
			extractErrorMessage(payload) ?? fallbackError ?? `Falha na requisição (HTTP ${status})`;
		throw new ClientFetchError(message, {
			status,
			payload,
			requestId,
		});
	}

	return res;
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
	const res = await fetchResponse(url, options);
	const data: unknown = await res.json().catch(() => null);
	return data as T;
}

export async function fetchBlob(url: string, options: FetchJsonOptions = {}): Promise<Blob> {
	const res = await fetchResponse(url, options);
	return res.blob();
}
