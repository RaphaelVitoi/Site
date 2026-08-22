const YOUTUBE_HOSTS = new Set(['youtube.com', 'youtu.be', 'youtube-nocookie.com']);

function parseExternalHttpUrl(href: string | undefined): URL | null {
	if (!href) return null;
	try {
		const url = new URL(href);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
	} catch {
		return null;
	}
}

export function isExternalHttpUrl(href: string | undefined): boolean {
	return parseExternalHttpUrl(href) !== null;
}

export function isEmbeddableMediaUrl(href: string | undefined): href is string {
	const url = parseExternalHttpUrl(href);
	if (!url) return false;

	const host = url.hostname.toLowerCase();
	const isYoutube = [...YOUTUBE_HOSTS].some(
		(allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`),
	);
	return isYoutube || (url.protocol === 'https:' && url.pathname.toLowerCase().endsWith('.mp4'));
}
