"use client";

interface SectionHeaderProps {
  readonly step: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly id?: string;
}

/**
 * IDENTITY: SectionHeader (SOTA UI)
 * ROLE: Cabeçalho padronizado para seções, seguindo o Design System.
 *       Elimina a necessidade de inline styles e garante consistência visual.
 */
export function SectionHeader({
  step,
  label,
  title,
  description,
  id,
}: Readonly<SectionHeaderProps>) {
  return (
    <div
      id={id}
      className="w-full mx-auto px-4 pt-12 pb-8 relative group flex flex-col items-center text-center"
    >
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px w-12 bg-linear-to-r from-transparent to-accent-indigo/50" />
        <span className="text-[0.65rem] font-black text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/20 px-4 py-1.5 rounded-full tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          {step}
        </span>
        <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-[0.3em]">
          {label}
        </span>
        <div className="h-px w-12 bg-linear-to-l from-transparent to-accent-indigo/50" />
      </div>

      <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black m-0 mb-6 tracking-tighter text-white font-heading uppercase group-hover:text-accent-indigo-light transition-colors duration-500 drop-shadow-lg">
        {title}
      </h2>

      <p className="m-0 text-[0.95rem] text-text-muted leading-relaxed max-w-2xl font-body font-medium">
        {description}
      </p>
    </div>
  );
}

export default SectionHeader;
