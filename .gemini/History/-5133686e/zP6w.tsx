import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Extração dos Parâmetros SOTA
    const po = Number.parseFloat(searchParams.get('po') || '0.20'); // Pot Odds Baseline (ex: 20%)
    const pm = Number.parseFloat(searchParams.get('pm') || '0.05'); // Perspectiva Matemática
    const mw = Number.parseInt(searchParams.get('mw') || '2', 10); // Entropia Multiway
    const ci = Number.parseFloat(searchParams.get('ci') || '1.5'); // Coeficiente de Insolvência
    const evFold = Number.parseFloat(searchParams.get('evFold') || '-1.12');

    // --- GEOMETRIA DA ZONA DE INSOLVÊNCIA ---
    // O SVG tem 400px de altura operável (Eixo Y invertido: 0 é o topo, 400 é o fundo)
    // Linha Pot Odds Estática (A ingênua barreira linear)
    const poY = 300 - (po * 100);

    // Curva de Perspectiva Matemática: Sofre decaimento parabólico via RIO exponencial (MW)
    // Quanto maior o multiway (mw), mais vertiginosa é a queda rumo ao fundo do gráfico
    const startY = poY - (pm * 500); // Se PM é positivo, começa acima das Pot Odds
    const endY = poY + (mw * 45); // O colapso

    // Bézier Quadrática: M = Start, Q = Control Point, End Point
    const curvePath = `M 100 ${startY} Q 600 ${startY + (mw * 10)}, 1100 ${endY}`;

    // O Polígono do Prejuízo Estratégico (Sombreado Vermelho)
    // Preenche a área onde a Curva Amarela afunda abaixo da Linha Verde
    const insolvencyZone = `M 100 ${poY} L 1100 ${poY} L 1100 ${endY} Q 600 ${startY + (mw * 10)}, 100 ${startY} Z`;

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full bg-slate-950 items-center justify-center p-12" style={{ fontFamily: 'monospace' }}>
          <div tw="absolute inset-0 bg-indigo-900 opacity-10" />

          {/* HEADER SOTA */}
          <div tw="flex w-full justify-between items-center mb-8 border-b border-white/10 pb-6">
            <div tw="flex flex-col">
              <span tw="text-cyan-400 text-3xl font-bold tracking-widest uppercase">VITOI QUANTUM ENGINE</span>
              <span tw="text-slate-400 text-xl uppercase tracking-widest mt-2">Diagnóstico de Insolvência Estratégica</span>
            </div>
            <div tw={`flex items-center border px-8 py-3 rounded-full ${ci > 1 ? 'bg-rose-500/20 border-rose-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
              <span tw={`text-2xl font-bold tracking-widest uppercase ${ci > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                Cᵢ: {ci.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ESTRUTURA SVG DA MENTE MATEMÁTICA */}
          <svg viewBox="0 0 1200 400" style={{ width: '100%', flex: '1 1 0%' }}>
            {/* Eixos Y - Guias de Utilidade */}
            <line x1="100" y1="100" x2="1100" y2="100" stroke="#334155" strokeWidth="2" strokeDasharray="10,10" />
            <line x1="100" y1="200" x2="1100" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="10,10" />
            <line x1="100" y1="300" x2="1100" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="10,10" />

            {/* Labels de Colisão */}
            <text x="30" y={poY + 6} fill="#10b981" fontSize="22" fontWeight="bold">Odds</text>
            <text x="30" y={endY + 6} fill="#f59e0b" fontSize="22" fontWeight="bold">PM</text>

            {/* A Zona de Prejuízo (Área Vermelha de Omissão Oculta) */}
            {ci > 1 && <path d={insolvencyZone} fill="rgba(225, 29, 72, 0.25)" />}

            {/* O Vetor Estático: Pot Odds (Miopia Linear) */}
            <line x1="100" y1={poY} x2="1100" y2={poY} stroke="#10b981" strokeWidth="6" />

            {/* O Vetor SOTA: Perspectiva Matemática (Decaimento por Entropia) */}
            <path d={curvePath} stroke="#f59e0b" strokeWidth="8" fill="none" />
          </svg>

          {/* FOOTER - TELEMETRIA RÁPIDA */}
          <div tw="flex w-full justify-between items-center mt-8 pt-6 border-t border-white/10">
            <div tw="flex items-center">
              <span tw="text-slate-400 text-xl mr-3 uppercase">Piso Dinâmico:</span>
              <span tw="text-emerald-400 text-3xl font-bold">{evFold > 0 ? '+' : ''}{evFold.toFixed(2)}bb</span>
            </div>
            <div tw="flex items-center">
              <span tw="text-slate-400 text-xl mr-3 uppercase">Entropia (RIO):</span>
              <span tw="text-amber-400 text-3xl font-bold">{mw} Oponentes</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`[SOTA] Colapso na Renderização da Bússola Visual.`, { status: 500 });
  }
}
