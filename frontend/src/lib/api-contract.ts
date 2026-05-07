const DEFAULT_NEXUS_API_BASE = 'http://127.0.0.1:17042';

function trimTrailingSlash(value: string): string {
    return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveClientBase(): string {
    return trimTrailingSlash(
        process.env.NEXT_PUBLIC_NEXUS_API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        DEFAULT_NEXUS_API_BASE
    );
}

function resolveServerBase(): string {
    return trimTrailingSlash(
        process.env.NEXUS_API_BASE ||
        process.env.NEXT_PUBLIC_NEXUS_API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        DEFAULT_NEXUS_API_BASE
    );
}

export const NEXUS_CLIENT_API_BASE = resolveClientBase();
export const NEXUS_SERVER_API_BASE = resolveServerBase();

export function buildNexusClientUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${NEXUS_CLIENT_API_BASE}${normalizedPath}`;
}

export function buildNexusServerUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${NEXUS_SERVER_API_BASE}${normalizedPath}`;
}
