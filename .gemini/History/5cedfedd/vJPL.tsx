"use client";

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function QuemSouPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="O Autor"
        subtitle="Estrategista High Stakes e idealizador do Framework de Perspectiva Matemática."
        category="Identidade"
        icon="fa-user-astronaut"
      />

      <div className="sota-container py-12 md:py-24 space-y-24">
        {/* Video Section */}
        <section className="max-w-4xl mx-auto">
          <SectionHeader
            step="INTRO"
            label="Mensagem"
            title="A Perspectiva Soberana"
            description="Uma introdução visual à filosofia SOTA e ao ecossistema do Monolito Nexus."
          />

          <GlassPanel className="mt-12 overflow-hidden border-accent-indigo/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] group">
            <div className="relative aspect-video bg-black/40">
              <video
                src="/0309.mp4"
                controls
                className="w-full h-full object-cover"
                poster="/images/hero-bg.png" // Placeholder poster
              >
                <track
                  kind="captions"
                  srcLang="pt"
                  label="Português"
                  src="/captions/0309.vtt"
                />
                Seu navegador não suporta a tag de vídeo.
              </video>
              <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-inherit" />
            </div>
            <div className="p-6 bg-bg-panel/40 border-t border-white/5">
              <p className="text-[0.7rem] font-mono text-text-dim uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                {"Vetor de Transmissão: Identidade SOTA"}
              </p>
            </div>
          </GlassPanel>
        </section>

        {/* Biography Placeholder (Improved) */}
        <section className="flex items-center justify-center">
          <div className="glass-panel p-12 text-center max-w-lg mx-auto border-accent-emerald/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <i className="fa-solid fa-code-branch text-4xl text-accent-emerald mb-6" />
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">
              Registro Biográfico
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              A documentação da trajetória acadêmica e as contribuições ao
              ecossistema estão sendo compiladas para esta via.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
