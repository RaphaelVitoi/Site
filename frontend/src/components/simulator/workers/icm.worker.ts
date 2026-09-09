import { processTableIcmRequest } from './icmTableProcessor';

globalThis.onmessage = (event: MessageEvent<unknown>) => {
  try {
    const response = processTableIcmRequest(event.data);
    (globalThis as unknown as Worker).postMessage(response, [response.payload.buffer]);
  } catch (error: unknown) {
    const id = typeof event.data === 'object' && event.data !== null && 'id' in event.data ? event.data.id : undefined;
    (globalThis as unknown as Worker).postMessage({
      id, error: error instanceof Error ? error.message : 'Falha no cálculo ICM.',
    });
  }
};
