/**
 * IDENTITY: JSON-LD SEO Generator
 * PATH: src/components/seo/JsonLd.tsx
 * ROLE: Injetar metadados estruturados para o Google (Schema.org) com tipagem estrita.
 */

export default function JsonLd({
	data,
}: Readonly<{ data: Record<string, unknown> | Record<string, unknown>[] }>) {
	const safeJsonString = JSON.stringify(data).replace(/</g, '\\u003c');
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: safeJsonString }}
		/>
	);
}
