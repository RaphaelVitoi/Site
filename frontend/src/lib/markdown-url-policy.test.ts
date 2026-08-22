import { isEmbeddableMediaUrl, isExternalHttpUrl } from './markdown-url-policy';

describe('markdown URL policy', () => {
	it('accepts only HTTP(S) links as external destinations', () => {
		expect(isExternalHttpUrl('https://example.com/article')).toBe(true);
		expect(isExternalHttpUrl('http://example.com/article')).toBe(true);
		expect(isExternalHttpUrl('/biblioteca')).toBe(false);
		expect(isExternalHttpUrl('javascript:alert(1)')).toBe(false);
	});

	it('embeds exact YouTube hosts and HTTPS MP4 files', () => {
		expect(isEmbeddableMediaUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
		expect(isEmbeddableMediaUrl('https://youtu.be/abc')).toBe(true);
		expect(isEmbeddableMediaUrl('https://cdn.example.com/video.MP4?quality=high')).toBe(true);
	});

	it('does not mistake a substring or an insecure MP4 URL for approved media', () => {
		expect(isEmbeddableMediaUrl('https://attacker.example/?youtube.com')).toBe(false);
		expect(isEmbeddableMediaUrl('https://youtube.com.attacker.example/watch')).toBe(false);
		expect(isEmbeddableMediaUrl('http://cdn.example.com/video.mp4')).toBe(false);
	});
});
