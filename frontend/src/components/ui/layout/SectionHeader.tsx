'use client';

interface SectionHeaderProps {
  readonly step: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly id?: string;
}

/**
 * IDENTITY: SectionHeader (SOTA UI GOLD)
 * ROLE: Cabeçalho padronizado para seções, seguindo o Design System.
 *       Usa uma hierarquia estável, sem efeitos responsivos competindo com o título.
 */
export function SectionHeader({ step, label, title, description, id }: Readonly<SectionHeaderProps>) {
  return (
    <div id={id} className="group relative mx-auto flex w-full flex-col items-center px-6 pt-20 pb-12 text-center">
      <div className="sota-header-kicker mb-10">
        <span className="sota-header-marker" aria-hidden="true" />
        <span className="sota-header-step">{step}</span>
        <span className="group-hover:text-text-main transition-colors duration-300">{label}</span>
      </div>

      <h2 className="sota-page-title mb-8">{title}</h2>

      <p className="text-text-muted font-body group-hover:text-text-main m-0 max-w-3xl text-[1.1rem] leading-loose font-medium opacity-90 transition-colors duration-500">
        {description}
      </p>
    </div>
  );
}

export default SectionHeader;
