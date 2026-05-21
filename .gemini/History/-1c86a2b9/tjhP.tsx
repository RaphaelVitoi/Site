'use client';

/**
 * IDENTITY: Painel de Perfil Preditivo SOTA
 * PATH: src/components/simulator/panels/PredictiveProfilePanel.tsx
 * ROLE: Monitoramento das heurísticas e distorções cognitivas do ambiente.
 */

import { useEffect, useState } from 'react';

interface PredictiveProfile {
  'Aversão ao Risco': number;
  'Pot Entrapment': number;
  'Miopia de Payjump': number;
  'Excesso de Agressão': number;
  'Passivo Estrutural (RIO)': number;
  'Desvio de Nash': number;
}

export default function PredictiveProfilePanel() {
  const [profile, setProfile] = useState<PredictiveProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fricção Zero: Leitura dinâmica via API Local/Proxy
        const res = await fetch('/api/predictive-profile', {
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (e) {
        console.error('[ENTROPIA] Falha ao carregar Perfil Preditivo', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-accent-indigo animate-pulse font-mono uppercase tracking-widest text-[0.7rem] border border-white/5 rounded-3xl bg-black/20">Sincronizando Oráculo Preditivo...</div>;
  }

  if (!profile) return null;

  return (
    <div className="glass-panel p-8 lg:p-10 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group/pred">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover/pred:opacity-10 transition-opacity">
        <i className="fa-solid fa-brain text-8xl text-accent-indigo"></i>
      </div>

      <div className="flex flex-col mb-10 relative z-10">
        <h3 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.3em] m-0 flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)] animate-pulse" />
           Perfil Preditivo &middot; <span className="text-text-muted">Fator Ψ</span>
        </h3>
        <p className="text-[0.65rem] text-text-dim mt-2 m-0 font-medium uppercase tracking-widest">
          Modelagem Comportamental &middot; Teoria dos Sistemas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {Object.entries(profile).map(([key, value]) => {
          // Termometria de Entropia (Cores baseadas no perigo da métrica)
          let colorClass = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
          if (value > 0.7) colorClass = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
          else if (value > 0.4) colorClass = 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';

          return (
            <div key={key} className="flex flex-col gap-3 p-5 rounded-2xl bg-black/40 border border-white/5 hover:bg-black/60 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-[0.65rem] text-text-muted uppercase font-black tracking-widest">{key}</span>
                <span className="text-[0.75rem] font-mono font-black text-white">{(value * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                  style={{
                    width: `${value * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
