import {
	getEditorialEvidenceLabel,
	type EditorialManifestEntry,
} from '@/content/editorialManifest';

const EVIDENCE_COLOR: Readonly<Record<EditorialManifestEntry['evidenceLevel'], string>> = {
	observation: 'text-accent-sky border-sky-500/20 bg-sky-500/10',
	hypothesis: 'text-accent-amber border-amber-500/20 bg-amber-500/10',
	reproducible_experiment: 'text-accent-indigo-light border-indigo-500/20 bg-indigo-500/10',
	externally_replicated: 'text-accent-emerald border-emerald-500/20 bg-emerald-500/10',
	scientific_contribution: 'text-accent-emerald border-emerald-500/20 bg-emerald-500/10',
	review_required: 'text-text-muted border-white/10 bg-white/5',
};

export function EditorialEvidencePanel({ entry }: Readonly<{ entry: EditorialManifestEntry }>) {
	return (
		<section className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40" aria-label="Proveniência editorial">
			<h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mb-5 border-b border-white/5 pb-4">
				Proveniência editorial
			</h4>
			<div className="space-y-4 text-xs text-text-dim">
				<div>
					<span className="block text-[0.55rem] uppercase font-bold mb-1">Status de evidência</span>
					<span className={`inline-flex rounded border px-2 py-1 text-[0.55rem] font-black uppercase tracking-widest ${EVIDENCE_COLOR[entry.evidenceLevel]}`}>
						{getEditorialEvidenceLabel(entry.evidenceLevel)}
					</span>
				</div>
				<div>
					<span className="block text-[0.55rem] uppercase font-bold mb-1">Versão</span>
					<span className="font-mono text-text-main">{entry.contentVersion}</span>
				</div>
				{entry.reviewedAt && (
					<div>
						<span className="block text-[0.55rem] uppercase font-bold mb-1">Revisado em</span>
						<span className="font-mono text-text-main">{entry.reviewedAt}</span>
					</div>
				)}
				{entry.methodRef && (
					<div>
						<span className="block text-[0.55rem] uppercase font-bold mb-1">Método</span>
						<span>{entry.methodRef}</span>
					</div>
				)}
				{entry.sources.length > 0 && (
					<div>
						<span className="block text-[0.55rem] uppercase font-bold mb-2">Fontes e artefatos</span>
						<ul className="space-y-1 list-disc pl-4 leading-relaxed">
							{entry.sources.map((source) => <li key={source}>{source}</li>)}
						</ul>
					</div>
				)}
				{entry.limitations.length > 0 && (
					<ul className="space-y-2 list-disc pl-4 leading-relaxed">
						{entry.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
					</ul>
				)}
			</div>
		</section>
	);
}
