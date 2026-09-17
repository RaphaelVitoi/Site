/**
 * @jest-environment jsdom
 */
import { dividirEmLotes, logTelemetryEvent, MAX_BYTES_POR_LOTE, tamanhoEmBytes, telemetryClient } from './telemetry-client';

const evento = (tamanho: number) => ({ category: 'quiz', componentName: 'x'.repeat(tamanho), evLoss: 0.5 });
const bytes = (v: unknown) => tamanhoEmBytes(JSON.stringify(v));

describe('cliente de telemetria (FE-10)', () => {
	const originalFetch = globalThis.fetch;
	afterEach(() => {
		globalThis.fetch = originalFetch;
		jest.useRealTimers();
	});

	it('nenhum lote ultrapassa o limite do corpo keepalive, e nada se perde', () => {
		const fila = Array.from({ length: 300 }, () => evento(1000));
		const lotes = dividirEmLotes(fila);
		expect(lotes.length).toBeGreaterThan(1);
		for (const batch of lotes) expect(bytes({ batch })).toBeLessThanOrEqual(MAX_BYTES_POR_LOTE);
		expect(lotes.flat()).toHaveLength(300);
	});

	it('evento isolado acima do limite é descartado sem derrubar os demais', () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		const lotes = dividirEmLotes([evento(10), evento(70_000), evento(10)]);
		expect(lotes.flat()).toHaveLength(2);
	});

	it('pagehide envia a fila pendente sem esperar o timer', () => {
		jest.useFakeTimers();
		const fetchMock = jest.fn().mockResolvedValue({ ok: true });
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		logTelemetryEvent(evento(10));
		expect(fetchMock).not.toHaveBeenCalled();
		globalThis.dispatchEvent(new Event('pagehide'));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][1]).toMatchObject({ keepalive: true });
		// O timer pendente foi cancelado: nada é reenviado.
		jest.advanceTimersByTime(5000);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(telemetryClient).toBeDefined();
	});
});
