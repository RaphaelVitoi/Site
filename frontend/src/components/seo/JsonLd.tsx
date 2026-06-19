/**
 * IDENTITY: JSON-LD SEO Generator
 * PATH: src/components/seo/JsonLd.tsx
 * ROLE: Injetar metadados estruturados para o Google (Schema.org) com tipagem estrita.
 */

export default function JsonLd({
	data,
}: Readonly<{ data: Record<string, unknown> | Record<string, unknown>[] }>) {
	return (
		<script type="application/ld+json">
			{JSON.stringify(data)}
		</script>
	);
}
