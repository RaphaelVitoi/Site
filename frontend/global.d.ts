declare global {
	const logger: {
		info(context: string, message: string, meta?: Record<string, unknown>): void;
		warn(context: string, message: string, meta?: Record<string, unknown>): void;
		error(context: string, message: string, meta?: Record<string, unknown>): void;
	};
}
export {};
