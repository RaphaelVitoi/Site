jest.mock('server-only', () => ({}));

import { resolveAuthSecret } from '@/lib/server/auth-secret';

describe('authentication secret boundary', () => {
	it('fails closed when a runtime outside development/build has no secret', () => {
		expect(() => resolveAuthSecret({ NODE_ENV: 'production' })).toThrow(
			'AUTH_SECRET or NEXTAUTH_SECRET must be configured',
		);
	});

	it('preserves the documented secret names with identical precedence', () => {
		expect(
			resolveAuthSecret({ AUTH_SECRET: 'auth-secret', NEXTAUTH_SECRET: 'legacy-secret' }),
		).toBe('auth-secret');
		expect(resolveAuthSecret({ NEXTAUTH_SECRET: 'legacy-secret' })).toBe('legacy-secret');
	});

	it('permits the fallback only in development or the production build phase', () => {
		expect(resolveAuthSecret({ NODE_ENV: 'development' })).toBeTruthy();
		expect(resolveAuthSecret({ NODE_ENV: 'production', NEXT_PHASE: 'phase-production-build' })).toBeTruthy();
	});
});
