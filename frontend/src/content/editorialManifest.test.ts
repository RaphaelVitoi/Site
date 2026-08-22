import {
	getEditorialEvidenceLabel,
	getEditorialManifestEntry,
} from './editorialManifest';

describe('editorial manifest', () => {
	it('never defaults an unknown dynamic article to validated evidence', () => {
		const entry = getEditorialManifestEntry('unknown-dynamic-slug');

		expect(entry.evidenceLevel).toBe('review_required');
		expect(getEditorialEvidenceLabel(entry.evidenceLevel)).toBe('Revisão metodológica necessária');
	});

	it('keeps PMev content explicitly marked as a hypothesis', () => {
		const entry = getEditorialManifestEntry('leitura-icm');

		expect(entry.evidenceLevel).toBe('hypothesis');
		expect(entry.limitations.length).toBeGreaterThan(0);
	});
});
