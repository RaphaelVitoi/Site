'use client';

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';

export default function QuemSouPage ()
{
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="O Autor"
        subtitle="Estrategista High Stakes e idealizador do Framework de Perspectiva Matemática."
        category="Identidade"
        icon="fa-user-astronaut"
      />
      <div className="sota-container flex items-center justify-center py-24">
        <div className="glass-panel p-12 text-center max-w-lg mx-auto border-accent-emerald/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <i className="fa-solid fa-code-branch text-4xl text-accent-emerald mb-6" />
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">Registro Biográfico</h2>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            A documentação da trajetória acadêmica e as contribuições ao ecossistema estão sendo compiladas para esta via.
          </p>
        </div>
      </div>
    </div>
  );
}
