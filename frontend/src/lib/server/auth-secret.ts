import 'server-only';

const DEVELOPMENT_AUTH_SECRET =
	'sota-default-secret-key-for-development-only-replace-in-prod-32-chars';

type AuthEnvironment = Partial<Pick<
	NodeJS.ProcessEnv,
	'AUTH_SECRET' | 'NEXTAUTH_SECRET' | 'NODE_ENV' | 'NEXT_PHASE'
>>;

export function resolveAuthSecret(environment: AuthEnvironment = process.env): string {
	const configuredSecret = environment['AUTH_SECRET'] || environment['NEXTAUTH_SECRET'];
	if (configuredSecret) return configuredSecret;

	const permitsDevelopmentFallback =
		environment['NODE_ENV'] === 'development' ||
		environment['NEXT_PHASE'] === 'phase-production-build';

	if (permitsDevelopmentFallback) return DEVELOPMENT_AUTH_SECRET;

	throw new Error(
		'AUTH_SECRET or NEXTAUTH_SECRET must be configured outside development and production builds.',
	);
}
