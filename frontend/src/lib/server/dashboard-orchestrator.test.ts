jest.mock('server-only', () => ({}));

import { shouldQueryDashboardOrchestrator } from '@/lib/server/dashboard-orchestrator';

describe('dashboard orchestrator boundary', () => {
	it('does not query the protected Nexus service without a server relay credential', () => {
		expect(shouldQueryDashboardOrchestrator({})).toBe(false);
		expect(shouldQueryDashboardOrchestrator({ API_SECRET_TOKEN: '   ' })).toBe(false);
	});

	it('permits the server-side query only with a non-empty relay credential', () => {
		expect(shouldQueryDashboardOrchestrator({ API_SECRET_TOKEN: 'server-only' })).toBe(true);
	});
});
