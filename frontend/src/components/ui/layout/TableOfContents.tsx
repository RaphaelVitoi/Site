interface TocItem {
	level: number;
	text: string;
	slug: string;
}

interface TableOfContentsProps {
	toc?: TocItem[];
	content?: string;
}

export default function TableOfContents({ toc, content }: Readonly<TableOfContentsProps>) {
	const finalToc: TocItem[] = toc ? [...toc] : [];

	if (finalToc.length === 0 && content) {
		const tocRegex = /^(##|###)\s+(.+)$/gm;
		let tocMatch = tocRegex.exec(content);
		while (tocMatch !== null) {
			const level = tocMatch[1]?.length ?? 2;
			const matchedText = tocMatch[2] ?? '';
			const text = matchedText
				.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
				.replace(/[`*_~]/g, '')
				.trim();
			const slug = text
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)+/g, '');
			finalToc.push({ level, text, slug });
			tocMatch = tocRegex.exec(content);
		}
	}

	if (finalToc.length === 0) return null;

	// SOTA: O(1) Lookup Table para identação, aniquilando a entropia do ternário aninhado (S3358)
	const levelMarginMap: Record<number, string> = { 3: 'ml-6', 4: 'ml-12' };

	return (
		<nav className="mb-10 p-6 rounded-lg bg-slate-900/40 border border-white/5 shadow-inner">
			<h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
				<i className="fa-solid fa-list-ul mr-3" /> Índice de Navegação
			</h4>
			<ul className="space-y-2">
				{finalToc.map((item) => (
					<li key={item.slug} className={levelMarginMap[item.level] || ''}>
						<a
							href={`#${item.slug}`}
							className="text-sm text-slate-400 hover:text-emerald-400 transition-colors block border-l-2 border-transparent hover:border-emerald-400 pl-3 -ml-3"
						>
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
