export interface TelemetryPayload {
	type?: string;
	category: string;
	time_ms: number;
	is_correct: boolean;
	ev_loss: number;
	user_id?: string;
}

/**
 * Emite um pulso sensorial para a malha preditiva (SQLite via Edge API).
 * Operação Fire-and-Forget (Fricção Zero) para não causar latência na UI.
 */
export function logTelemetryEvent(payload: TelemetryPayload): void {
	fetch('/api/telemetry', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			type: payload.type || 'quiz',
			category: payload.category,
			time_ms: payload.time_ms,
			is_correct: payload.is_correct,
			ev_loss: payload.ev_loss,
			user_id: payload.user_id || 'local',
		}),
	}).catch((error) => {
		// Supressão silenciosa: a telemetria não deve quebrar a experiência do usuário.
		console.warn('[TELEMETRY] Falha orgânica ao emitir pulso sensorial:', error);
	});
}
