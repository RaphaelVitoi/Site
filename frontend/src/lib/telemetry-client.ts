import { type TelemetryPayload, TelemetryPayloadSchema } from '@/lib/schemas';

/**
 * SOTA Telemetry Client (Singleton)
 * Fila em memória, envio em lote e em segundo plano.
 *
 * FE-10 (auditoria 2026-09-17). O cliente anterior enviava a fila inteira com `keepalive: true`, e o
 * navegador RECUSA corpo `keepalive` acima de 64 KiB: o `fetch` rejeitava e o `.catch(() => {})`
 * descartava o lote em silêncio. E só enviava pelo timer de 2 s — o comentário prometia envio "mesmo
 * na morte da aba", mas nada ouvia o fechamento da página.
 */

/** Margem abaixo do limite de 64 KiB do corpo `keepalive`, medido em bytes UTF-8. */
export const MAX_BYTES_POR_LOTE = 60 * 1024;

/** Tamanho UTF-8 em bytes. Sem `TextEncoder` global no topo do módulo: nem todo ambiente o expõe. */
export function tamanhoEmBytes(texto: string): number {
	if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(texto).length;
	return new Blob([texto]).size;
}

/** Divide a fila em lotes cujo corpo JSON cabe no limite; evento isolado grande demais é descartado. */
export function dividirEmLotes(eventos: TelemetryPayload[], maxBytes = MAX_BYTES_POR_LOTE): TelemetryPayload[][] {
	// Corpo = `{"batch":[` + eventos separados por vírgula + `]}`. Cada evento é serializado uma vez só,
	// e o tamanho do lote é somado incrementalmente: O(n), não O(n²) reserializando o lote a cada adição.
	const MOLDURA = tamanhoEmBytes('{"batch":[]}');
	const lotes: TelemetryPayload[][] = [];
	let atual: TelemetryPayload[] = [];
	let bytesAtuais = MOLDURA;
	for (const evento of eventos) {
		const bytesEvento = tamanhoEmBytes(JSON.stringify(evento));
		if (MOLDURA + bytesEvento > maxBytes) {
			console.warn('[TELEMETRY] Evento acima do limite de envio descartado.');
			continue;
		}
		const separador = atual.length > 0 ? 1 : 0;
		if (bytesAtuais + separador + bytesEvento > maxBytes) {
			lotes.push(atual);
			atual = [];
			bytesAtuais = MOLDURA;
		}
		bytesAtuais += (atual.length > 0 ? 1 : 0) + bytesEvento;
		atual.push(evento);
	}
	if (atual.length > 0) lotes.push(atual);
	return lotes;
}

class SotaTelemetryClient {
	private static instance: SotaTelemetryClient;
	private queue: TelemetryPayload[] = [];
	private flushTimeout: ReturnType<typeof setTimeout> | null = null;

	private constructor() {
		if (globalThis.window !== undefined) {
			// `pagehide` cobre fechamento de aba e navegação para fora, inclusive com bfcache.
			globalThis.addEventListener('pagehide', () => this.flush());
		}
	}

	public static getInstance(): SotaTelemetryClient {
		if (!SotaTelemetryClient.instance) SotaTelemetryClient.instance = new SotaTelemetryClient();
		return SotaTelemetryClient.instance;
	}

	public log(payload: TelemetryPayload): void {
		const validated = TelemetryPayloadSchema.safeParse(payload);
		if (!validated.success) {
			console.warn('[TELEMETRY] Entropia detectada no payload:', validated.error.issues);
			return;
		}

		this.queue.push(validated.data);
		this.flushTimeout ??= setTimeout(() => this.flush(), 2000);
	}

	public flush(): void {
		if (this.flushTimeout) clearTimeout(this.flushTimeout);
		this.flushTimeout = null;
		if (this.queue.length === 0) return;

		const eventos = this.queue;
		this.queue = [];

		for (const batch of dividirEmLotes(eventos)) {
			fetch('/api/v1/telemetry', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ batch }),
				keepalive: true,
			}).catch(() => {}); // Falha de rede não interrompe a UI; o lote já respeita o limite de keepalive.
		}
	}
}

export const telemetryClient = SotaTelemetryClient.getInstance();
export const logTelemetryEvent = (payload: TelemetryPayload): void => telemetryClient.log(payload);
