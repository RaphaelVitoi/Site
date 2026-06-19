import { type TelemetryPayload, TelemetryPayloadSchema } from '@/lib/schemas';

/**
 * SOTA Telemetry Client (Singleton)
 * Implementa Fricção Zero via Queueing e Background Fetch (Fire-and-Forget).
 */
class SotaTelemetryClient {
	private static instance: SotaTelemetryClient;
	private queue: TelemetryPayload[] = [];
	private flushTimeout: ReturnType<typeof setTimeout> | null = null;

	private constructor() {}

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

	private flush() {
		this.flushTimeout = null;
		if (this.queue.length === 0) return;

		const batch = [...this.queue];
		this.queue = [];

		// Disparo assíncrono O(1). A flag 'keepalive' assegura o envio mesmo na morte da aba.
		batch.forEach((data) => {
			fetch('/api/v1/telemetry', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
				keepalive: true,
			}).catch(() => {}); // Omissão silenciosa para preservar a UI
		});
	}
}

export const telemetryClient = SotaTelemetryClient.getInstance();
export const logTelemetryEvent = (payload: TelemetryPayload): void => telemetryClient.log(payload);
