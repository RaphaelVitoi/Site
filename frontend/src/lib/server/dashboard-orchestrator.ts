import 'server-only';

/**
 * The Nexus endpoints are protected by the server relay credential. A dashboard
 * render without it must remain visibly unavailable instead of issuing a known
 * unauthenticated request and presenting fallback values as live telemetry.
 */
export function shouldQueryDashboardOrchestrator(
	environment: NodeJS.ProcessEnv = process.env,
): boolean {
	return Boolean(environment['API_SECRET_TOKEN']?.trim());
}
