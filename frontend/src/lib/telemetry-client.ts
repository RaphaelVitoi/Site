import { TelemetryPayload, TelemetryPayloadSchema } from '@/lib/schemas';

type TelemetryResult = {
    success: boolean;
    eventId?: string | number;
    error?: string;
};

export async function logTelemetryEvent(payload: TelemetryPayload): Promise<TelemetryResult> {
    const validated = TelemetryPayloadSchema.safeParse(payload);

    if (!validated.success) {
        console.error('[TELEMETRY-CLIENT] Invalid payload', validated.error.issues);
        return { success: false, error: 'Contrato semantico violado.' };
    }

    try {
        const response = await fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validated.data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TELEMETRY-CLIENT] Request failed', errorText);
            return { success: false, error: 'Falha na persistencia da telemetria.' };
        }

        return (await response.json()) as TelemetryResult;
    } catch (error) {
        console.error('[TELEMETRY-CLIENT] Network failure', error);
        return { success: false, error: 'Falha de rede na telemetria.' };
    }
}
