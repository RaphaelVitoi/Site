'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

const modules = [
  {
    num: 1,
    title: 'O Problema e o Mapa',
    desc: 'Fundamentos de precificação e risco.',
    topics: [
      'ICM desde a mão 1 (não apenas na bolha)',
      'Risk Premium: definição precisa, cálculo e intuição',
      'RP vs Bubble Factor: relações de equidade',
      'Calculadora de valuation de stacks em FTs reais',
    ],
  },
  {
    num: 2,
    title: 'Toy-Games como Laboratório',
    desc: 'Isolamento de variáveis estratégicas.',
    topics: [
      'Justificativa metodológica: isolamento de variáveis',
      '5 Toy-Games: RP progressivo no OOP (RP 0 → 24)',
      '3 Toy-Games: RP invertido no IP (CL vs Short)',
      'Conceitos emergentes: Teto do RP e Vantagem de Risco',
    ],
  },
  {
    num: 3,
    title: 'ICM Pós-Flop — A Fronteira',
    desc: 'O Downward Drift no pós-flop.',
    topics: [
      'Por que o edge migrou do pré-flop para o pós-flop',
      'Downward Drift: transformação de sizings e ações',
      'SPR e distribuição do Risk Premium por street',
      'Covering advantage e premium check-back',
    ],
  },
  {
    num: 4,
    title: 'Variáveis Contextuais',
    desc: 'Impactos e dinâmica de torneios.',
    topics: [
      'Estruturas de payout (Flat vs Top-Heavy)',
      'FGS (Future Game Simulation) vs ICM clássico',
      'Torneios KO/Bounty: colisão de RP e Bounty Power',
      'Dinâmica de CL: leverage futuro e risco de ruína',
    ],
  },
  {
    num: 5,
    title: 'Aplicação Prática e Conexões',
    desc: 'Heurísticas de combate em tempo real.',
    topics: [
      'Checklist de bolso "Antevisão" e 10 erros comuns',
      'Configuração de laboratório solo com solvers',
      'Loss aversion sob a ótica da Prospect Theory',
      'Teoria de Sistemas: a mesa como organismo integrado',
    ],
  },
];

export function ModuleExplorer() {
  const [activeModule, setActiveModule] = useState<number>(0);
  const moduleButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleModuleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return;

    event.preventDefault();
    let nextIndex: number;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = modules.length - 1;
    else {
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      nextIndex = (index + direction + modules.length) % modules.length;
    }
    setActiveModule(nextIndex);
    moduleButtonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[38.2%_61.8%]">
      {/* Index list */}
      <div role="tablist" aria-label="Módulos da ementa" className="flex flex-col gap-2">
        {modules.map((m, idx) => (
          <button
            key={m.num}
            type="button"
            id={`module-tab-${m.num}`}
            role="tab"
            aria-selected={activeModule === idx}
            aria-controls={`module-panel-${m.num}`}
            tabIndex={activeModule === idx ? 0 : -1}
            ref={(element) => {
              moduleButtonRefs.current[idx] = element;
            }}
            onClick={() => setActiveModule(idx)}
            onKeyDown={(event) => handleModuleKeyDown(event, idx)}
            className={`flex items-center justify-between rounded border px-5 py-4 text-left font-mono text-sm tracking-[0.12em] transition-all duration-300 ${
              activeModule === idx
                ? 'border-[#0D0C0A] bg-[#0D0C0A] text-[#F5F3EE]'
                : 'border-[#DED9D2] bg-transparent text-[#5d5a55] hover:border-[#0D0C0A] hover:text-[#0D0C0A]'
            }`}
          >
            <span className="font-bold">MÓDULO 0{m.num}</span>
            <span className="max-w-30 text-right text-xs leading-tight">{m.title}</span>
          </button>
        ))}
      </div>

      {/* Content Detail Panel */}
      <div
        id={`module-panel-${modules[activeModule]?.num ?? 1}`}
        role="tabpanel"
        aria-labelledby={`module-tab-${modules[activeModule]?.num ?? 1}`}
        className="flex min-h-85 flex-col justify-between rounded-xl border border-[#DED9D2] bg-[#FAFAF7] p-8 shadow-[0_4px_20px_rgba(13,12,10,0.02)] lg:p-10"
      >
        {(() => {
          const currentModule = modules[activeModule];
          if (!currentModule) return null;
          return (
            <div className="space-y-8">
              <div>
                <p className="mb-3.5 font-mono text-xs font-bold tracking-[0.14em] text-[#765421] uppercase">
                  Módulo 0{currentModule.num} · {currentModule.desc}
                </p>
                <h3 className="font-display text-[1.8rem] leading-[1.2] tracking-tight text-[#0D0C0A]">
                  {currentModule.title}
                </h3>
              </div>
              <div className="h-px bg-[#DED9D2]" />
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentModule.topics.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 font-serif text-[1.05rem] leading-[1.65] text-[#262423]"
                  >
                    <div className="mt-2.25 h-1 w-1 shrink-0 rounded-full bg-[#B09460]" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-4">
                {[
                  { href: '/biblioteca', icon: 'fa-book-open', label: 'Biblioteca' },
                  { href: '/simulador', icon: 'fa-scale-unbalanced', label: 'Simulador' },
                  { href: '/simulador/gto-cfr', icon: 'fa-network-wired', label: 'Lab CFR' },
                ].map((cta) => (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="flex items-center gap-2 rounded border border-[#DED9D2] px-5.5 py-2.5 font-mono text-xs tracking-[0.14em] text-[#262423] uppercase transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
                  >
                    <i className={`fa-solid ${cta.icon} text-[#B09460]`} /> {cta.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
