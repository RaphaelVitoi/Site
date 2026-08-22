'use client';

/**
 * IDENTITY: O Protocolo Smart Sniper v7.0 GOLD
 * PATH: src/app/biblioteca/smart-sniper/page.tsx
 * ROLE: Manual de gestão de carreira e alta performance sob o Paradigma SOTA.
 * AESTHETIC: SOTA Gold Standard (Visual Hierarchy, Symmetry, Glassmorphism).
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import Link from 'next/link';

export default function SmartSniperPage() {
  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen overflow-x-hidden pb-32">
      <ContentPageHeader
        title="Protocolo Smart Sniper"
        subtitle="A antítese do grind tradicional: Gestão de Carreira, Eficiência Matemática e a exegese da Alta Performance em MTTs."
        category="Doutrina"
        icon="fa-crosshairs"
      />

      <div className="sota-container relative z-10 -mt-16 flex flex-col gap-32">
        {/* Manifesto Section */}
        <section className="flex flex-col gap-12">
          <SectionHeader
            step="01"
            label="Manifesto"
            title="A Antítese do Grind"
            description="Focado em Lucro Líquido e Longevidade, não em gerar rake para os sites."
          />

          <GlassPanel className="bg-bg-panel/60 group/manifesto relative mx-auto max-w-5xl overflow-hidden rounded-4xl border-white/5 p-10 shadow-2xl md:p-16">
            <div className="bg-accent-indigo/10 group-hover/manifesto:bg-accent-indigo/15 pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full blur-[120px] transition-all duration-1000" />

            <div className="prose prose-invert prose-indigo lg:prose-xl relative z-10 max-w-none">
              <p className="leading-loose text-indigo-100/80">
                O &quot;Grind&quot; tradicional morreu. A velha escola ensinava que para vencer no poker você precisava
                abrir 15 telas, jogar 12 horas por dia e aceitar uma variância brutal em nome do &quot;longo
                prazo&quot;. Este documento apresenta a antítese dessa ideia. O{' '}
                <strong className="text-white">Protocolo Smart Sniper</strong> não foi desenhado para gerar rake; foi
                desenhado para gerar <strong className="text-accent-indigo-light">Lucro Líquido e Longevidade</strong>{' '}
                para você.
              </p>

              <div className="my-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                <PillarCard
                  number="1"
                  label="Eficiência"
                  title="Financeira"
                  desc="Buscamos o maior $/Hour, não apenas ROI bruto."
                  color="emerald"
                />
                <PillarCard
                  number="2"
                  label="Sustentabilidade"
                  title="Cognitiva"
                  desc="Respeito aos limites biológicos do cérebro."
                  color="indigo"
                />
                <PillarCard
                  number="3"
                  label="Matemática"
                  title="Defensiva"
                  desc="Seleção cirúrgica para blindar o bankroll."
                  color="violet"
                />
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Rotina Section */}
        <section className="flex flex-col gap-12">
          <SectionHeader
            step="02"
            label="Operação"
            title="A Estratégia Sniper"
            description="De segunda a sábado, o objetivo é a construção de bankroll através do fluxo de caixa estável."
          />

          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_0.8fr]">
            <div className="glass-panel bg-bg-panel/40 group/volume relative overflow-hidden rounded-4xl border-white/5 p-10 shadow-xl md:p-12">
              <h3 className="mb-8 flex items-center gap-4 text-2xl font-black tracking-tighter text-white uppercase">
                <i className="fa-solid fa-display text-accent-indigo" /> Volume Otimizado
              </h3>
              <p className="mb-10 leading-relaxed font-medium text-indigo-100/70">
                A <strong className="text-white">Lei de Yerkes-Dodson</strong> demonstra que a performance humana segue
                uma curva de U invertido. Acima de 8 telas, o edge técnico desaparece e o cérebro entra em C-Game
                automático.
              </p>

              <div className="overflow-hidden rounded-3xl border border-white/5 bg-slate-950/60 shadow-inner">
                <table className="w-full text-left font-mono text-[0.75rem] tabular-nums">
                  <thead className="text-text-muted border-b border-white/5 bg-white/5 tracking-widest uppercase">
                    <tr>
                      <th className="p-6 font-black">Parâmetro</th>
                      <th className="p-6 font-black">Regra SOTA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="transition-colors hover:bg-white/5">
                      <td className="p-6 font-bold text-white uppercase">Telas Ativas</td>
                      <td className="text-accent-emerald p-6 text-base font-black">Max 6 a 8</td>
                    </tr>
                    <tr className="transition-colors hover:bg-white/5">
                      <td className="p-6 font-bold text-white uppercase">ABI (Average Buy-in)</td>
                      <td className="text-accent-indigo-light p-6 text-base font-black">Dinâmico</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel border-accent-indigo/20 group/entry relative overflow-hidden rounded-4xl bg-slate-900/60 p-10 shadow-2xl md:p-12">
              <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_top_right] to-transparent" />
              <h3 className="mb-6 flex items-center gap-4 text-2xl font-black tracking-tighter text-white uppercase">
                <i className="fa-solid fa-bullseye text-accent-indigo-light" /> Entrada Cirúrgica
              </h3>
              <p className="border-accent-indigo/40 border-l-2 py-2 pl-6 leading-loose text-indigo-100/80 italic">
                &quot;Nós não registramos no Nível 1. Capturamos stacks já valorizadas pelo ICM sem carregar o custo de
                gerá-la.&quot;
              </p>
              <div className="mt-8 rounded-2xl border border-white/5 bg-black/40 p-6 text-center">
                <span className="text-text-darker mb-3 block text-[0.6rem] font-black tracking-[0.4em] uppercase">
                  Zona de Arbitragem ICM
                </span>
                <span className="font-mono text-3xl font-black tracking-tighter text-white tabular-nums">
                  30-50 BBs
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Domingo Section */}
        <section className="flex flex-col gap-12">
          <SectionHeader
            step="03"
            label="High Stakes"
            title="Risco Assimétrico"
            description="A aplicação prática da teoria Barbell: proteger o bankroll na semana, buscar a lua no domingo."
          />

          <div className="glass-panel from-bg-panel/80 to-bg-deep shadow-3xl group/domingo relative mx-auto w-full max-w-5xl overflow-hidden rounded-4xl border-white/5 bg-linear-to-br p-10 md:p-16">
            <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_center_center] to-transparent" />
            <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <div className="bg-accent-amber/10 border-accent-amber/20 text-accent-amber flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg">
                  <i className="fa-solid fa-shield-halved text-xl" />
                </div>
                <h4 className="m-0 text-xl font-black tracking-tighter text-white uppercase">Teto de Gastos Semanal</h4>
                <p className="text-text-dim leading-relaxed font-medium">
                  O gasto total de domingo deve ser igual ao gasto médio semanal, impedindo que um dia ruim comprometa
                  meses de solvência.
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg">
                  <i className="fa-solid fa-gem text-xl" />
                </div>
                <h4 className="m-0 text-xl font-black tracking-tighter text-white uppercase">
                  Foco de Elite (4 Telas)
                </h4>
                <p className="text-text-dim leading-relaxed font-medium">
                  Em vez de volume barato, jogamos 4 Majors com ABI elevado. Qualidade total para cravadas de 5 dígitos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-5xl pb-24">
          <div className="glass-panel border-accent-indigo/20 group/cta relative overflow-hidden rounded-[3rem] border bg-slate-950/60 p-16 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
            <div className="from-accent-indigo/10 pointer-events-none absolute inset-0 bg-radial-[at_bottom_center] to-transparent" />
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <h3 className="m-0 text-3xl font-black tracking-tighter text-white uppercase md:text-5xl">
                  A Prova Matemática
                </h3>
                <p className="text-text-muted mx-auto max-w-2xl text-lg leading-relaxed font-medium">
                  Não confie em promessas. Veja os dados brutos de simulações de Monte Carlo que podem testar este
                  protocolo contra um baseline pré-definido.
                </p>
              </div>
              <Link
                href="/biblioteca/validacao-smart-sniper"
                className="bg-accent-indigo group/btn inline-flex items-center gap-4 rounded-full px-12 py-5 text-[0.8rem] font-black tracking-[0.3em] text-white uppercase transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] active:scale-95"
              >
                Validar Protocolo{' '}
                <i className="fa-solid fa-arrow-right-long transition-transform group-hover/btn:translate-x-2" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-4xl flex-col items-center gap-6 border-t border-white/5 pt-16 text-center opacity-40 transition-opacity duration-1000 hover:opacity-100">
          <div className="flex gap-4">
            <div className="bg-accent-indigo h-1.5 w-1.5 rounded-full" />
            <div className="bg-accent-indigo h-1.5 w-1.5 rounded-full" />
            <div className="bg-accent-indigo h-1.5 w-1.5 rounded-full" />
          </div>
          <p className="text-text-muted m-0 text-[0.65rem] font-black tracking-[0.4em] uppercase">
            © 2026 Raphael Vitoi · Monolito Nexus · SOTA Protocolo Sniper
          </p>
        </footer>
      </div>
    </div>
  );
}

function PillarCard({
  number,
  label,
  title,
  desc,
  color,
}: Readonly<{
  number: string;
  label: string;
  title: string;
  desc: string;
  color: string;
}>) {
  const colorClasses = {
    emerald: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20',
    indigo: 'text-accent-indigo-light bg-accent-indigo/10 border-accent-indigo/20',
    violet: 'text-accent-violet-light bg-accent-violet/10 border-accent-violet/20',
  }[color as 'emerald' | 'indigo' | 'violet'];

  return (
    <div className="group/pillar flex flex-col gap-5 rounded-3xl border border-white/5 bg-black/40 p-8 shadow-inner transition-all duration-500 hover:-translate-y-1 hover:border-white/10">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black ${colorClasses}`}
      >
        {number}
      </div>
      <div className="space-y-1">
        <span className="text-text-darker block text-[0.55rem] font-black tracking-[0.3em] uppercase">{label}</span>
        <h4 className="m-0 text-lg font-black tracking-widest text-white uppercase">{title}</h4>
      </div>
      <p className="text-text-dim group-hover/pillar:text-text-muted m-0 text-[0.8rem] leading-relaxed font-medium transition-colors">
        {desc}
      </p>
    </div>
  );
}
