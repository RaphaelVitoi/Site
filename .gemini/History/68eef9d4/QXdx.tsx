// frontend/src/app/laboratorio-v2/gto-cfr/page.tsx
'use client';

import Header from '@/components/layout/Header';
import { useState } from 'react';

export default function GtoCfrDashboard() {
  const [pot, setPot] = useState( 100 );
  const [target, setTarget] = useState( 1000 );
  const [streets, setStreets] = useState( 3 );

  // Geometric formula replicating engine/math_sota.py
  const growthFactor = target / pot;
  const onePlusTwoF = Math.pow( growthFactor, 1 / streets );
  const f = ( onePlusTwoF - 1 ) / 2;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-accent-primary mb-4">Módulo Híbrido: GTO & CFR (SOTA)</h1>
        <p className="text-slate-400 mb-8">
          Integração da Teoria de Sistemas com A* Geometric Sizing e Regret Matching.
        </p>

        <section className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">A* Geometric Bet Sizing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col">
              <label htmlFor="pot-input" className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Pote Atual (ChipEV)</label>
              <input
                id="pot-input"
                type="number"
                value={ pot }
                onChange={ e => setPot( Number( e.target.value ) ) }
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="target-input" className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Alvo (All-in River)</label>
              <input
                id="target-input"
                type="number"
                value={ target }
                onChange={ e => setTarget( Number( e.target.value ) ) }
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="streets-input" className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Rodadas Restantes (Streets)</label>
              <input
                id="streets-input"
                type="number"
                value={ streets }
                onChange={ e => setStreets( Number( e.target.value ) ) }
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-emerald-500/30 flex justify-between items-center group hover:border-emerald-500 transition-all">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-tighter">Fração Geométrica (f)</p>
              <p className="text-4xl font-black text-emerald-400">{ ( f * 100 ).toFixed( 1 ) }% <span className="text-lg font-normal text-slate-600">do pote</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 italic">Growth Factor: { growthFactor.toFixed( 2 ) }x</p>
              <p className="text-xs text-slate-500 italic">Exponential Scale: { onePlusTwoF.toFixed( 3 ) }</p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl opacity-50 cursor-not-allowed">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">CFR Regret Matching Engine</h2>
          <p className="text-slate-500 italic">Módulo de convergência Bayesiana em desenvolvimento no Kernel SOTA...</p>
        </section>
      </main>
    </div>
  );
}
