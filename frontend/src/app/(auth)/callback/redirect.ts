/** Returns a path guaranteed to stay on the current application origin. */
export function safeRedirectPath(candidate: string | null): string {
	if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//') || /[\\\u0000-\u001f]/.test(candidate)) {
		return '/';
	}
	return candidate;
}
