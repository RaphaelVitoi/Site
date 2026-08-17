jest.mock('server-only', () => ({}));

import { resolveTelemetryIdentity } from '@/lib/server/telemetry-identity';

describe('telemetry identity boundary', () => {
	it('rejects a client identity that conflicts with the authenticated session', () => {
		expect(resolveTelemetryIdentity('session-user', 'other-user')).toEqual({
			ok: false,
			status: 403,
			error: 'Telemetry identity does not match the session.',
		});
	});

	it('rejects a session without a stable user identity', () => {
		expect(resolveTelemetryIdentity(undefined, undefined)).toMatchObject({ ok: false, status: 401 });
	});

	it('derives identity from the session for omitted or matching legacy input', () => {
		expect(resolveTelemetryIdentity('session-user', undefined)).toEqual({
			ok: true,
			userId: 'session-user',
		});
		expect(resolveTelemetryIdentity('session-user', 'session-user')).toEqual({
			ok: true,
			userId: 'session-user',
		});
	});
});
