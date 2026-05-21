interface TocItem {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  toc: TocItem[];
}

export default function TableOfContents({
  toc,
}: Readonly<TableOfContentsProps>) {
  if (!toc || toc.length === 0) return null;

  // SOTA: O(1) Lookup Table para identação, aniquilando a entropia do ternário aninhado (S3358)
  const levelMarginMap: Record<number, string> = { 3: "ml-6", 4: "ml-12" };

  return (
    <nav className="mb-10 p-6 rounded-lg bg-slate-900/40 border border-white/5 shadow-inner">
      <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
        <i className="fa-solid fa-list-ul mr-3" /> Índice de Navegação
      </h4>
      <ul className="space-y-2">
        {toc.map((item) => (
          <li key={item.slug} className={levelMarginMap[item.level] || ""}>
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
