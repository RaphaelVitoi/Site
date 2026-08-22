import {
  EDITORIAL_ENTRIES,
  getEditorialEvidenceLabel,
  getEditorialManifestEntry,
  getLibraryCategories,
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

  it('uses one catalog for every static library card', () => {
    const categories = getLibraryCategories();
    const indexedSlugs = categories.flatMap((category) => category.articles.map((article) => article.slug));

    expect(indexedSlugs).toHaveLength(26);
    expect(new Set(indexedSlugs).size).toBe(indexedSlugs.length);
    expect(indexedSlugs).not.toContain('icm-pos-flop');
  });

  it('makes every catalog item navigable and epistemically declared', () => {
    for (const entry of EDITORIAL_ENTRIES) {
      expect(entry.href).toMatch(/^\/(aulas|biblioteca)\//);
      expect(entry.title).not.toHaveLength(0);
      expect(entry.summary).not.toHaveLength(0);
      expect(entry.limitations.length).toBeGreaterThan(0);
    }
  });

  it('resolves every declared didactic continuation', () => {
    for (const entry of EDITORIAL_ENTRIES) {
      for (const slug of [...(entry.prerequisites ?? []), ...(entry.nextSlugs ?? [])]) {
        expect(getEditorialManifestEntry(slug).contentVersion).toBe('editorial-v8.1');
      }
    }
  });
});
