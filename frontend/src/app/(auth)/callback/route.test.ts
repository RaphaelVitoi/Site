import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
	it.each(['/', '/dashboard', '/biblioteca?tab=recent'])('accepts an internal path: %s', (candidate) => {
		expect(safeRedirectPath(candidate)).toBe(candidate);
	});

	it.each([
		'//attacker.example',
		'https://attacker.example',
		'\\\\attacker.example',
		'/\\attacker.example',
		'/safe\u0000unsafe',
		'',
		null,
	])('rejects an external or malformed redirect target: %s', (candidate) => {
		expect(safeRedirectPath(candidate)).toBe('/');
	});
});
