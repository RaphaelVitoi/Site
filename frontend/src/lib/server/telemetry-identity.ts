import 'server-only';

export type TelemetryIdentityResult =
	| { ok: true; userId: string }
	| { ok: false; status: 401 | 403; error: string };

export function resolveTelemetryIdentity(
	sessionUserId: string | undefined,
	claimedUserId: string | undefined,
): TelemetryIdentityResult {
	if (!sessionUserId) {
		return { ok: false, status: 401, error: 'Authenticated session has no user identity.' };
	}

	if (claimedUserId && claimedUserId !== sessionUserId) {
		return { ok: false, status: 403, error: 'Telemetry identity does not match the session.' };
	}

	return { ok: true, userId: sessionUserId };
}
