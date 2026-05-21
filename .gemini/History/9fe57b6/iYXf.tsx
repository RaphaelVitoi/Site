/**
 * IDENTITY: Motor ICM — Página de Entrada
 * PATH: src/app/tools/simulador/page.tsx
 * ROLE: Apresentação didática do simulador e ponto de entrada do MasterSimulator.
 * BINDING: [SimuladorICM.tsx → MasterSimulator.tsx]
 */

import SimuladorICM from '@/components/SimuladorICM';
import ReferencialAula12 from '@/components/simulator/ReferencialAula12';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Motor ICM | TrueICM',
  description: 'Visualize como o ICM distorce as frequências de equilíbrio GTO em cenários reais de torneio. Calcule Risk Premium, Bubble Factor e ajuste cada ação em tempo real.',
};

export default function SimuladorPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <header className="page-header" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div className="container">
          <p className="page-label">
            <span className="fa-solid fa-flask" /> Motor ICM
          </p>
          <h1 style={{
            background: 'linear-gradient(135deg, #fff 0%, #fca5a5 50%, #a5b4fc 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            Geometria do Risco
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--sim-text-muted)', margin: '0 auto 1.75rem', maxWidth: '520px', lineHeight: 1.6 }}>
            O ICM distorce as frequências GTO. Este motor quantifica <strong style={{ color: 'var(--sim-text)', fontWeight: 600 }}>quanto</strong> — ação por ação.
          </p>

          {/* Três pilares em grid horizontal */}
          <div style={{
            maxWidth: '760px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            {/* O problema */}
            <div style={{
              borderTop: '2px solid var(--sim-border)',
              padding: '1rem',
              backgroundColor: 'var(--sim-surface)',
              borderRadius: '0 0 8px 8px',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--sim-text)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                O problema
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sim-text-muted)', lineHeight: 1.6 }}>
                As frequências do solver <strong style={{ color: 'var(--sim-text)', fontWeight: 600 }}>não se aplicam direto</strong> em torneio. O ICM distorce tudo — mas quanto? 5%? 20%? IP ou OOP?
              </p>
            </div>

            {/* O que é */}
            <div style={{
              borderTop: '2px solid var(--sim-success)',
              padding: '1rem',
              backgroundColor: 'var(--sim-surface)',
              borderRadius: '0 0 8px 8px',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--sim-success)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                O que é
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sim-text-muted)', lineHeight: 1.6 }}>
                Uma <strong style={{ color: 'var(--sim-text)', fontWeight: 600 }}>lente sobre a distorção</strong>. Mostra o Δ concreto por ação — não um solver, mas a régua entre GTO e torneio.
              </p>
            </div>

            {/* Como usar */}
            <div style={{
              borderTop: '2px solid var(--sim-text-muted)',
              padding: '1rem',
              backgroundColor: 'var(--sim-bg)',
              borderRadius: '0 0 8px 8px',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--sim-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Como usar
              </p>
              <ol style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {[
                  'Escolha um cenário de stack',
                  'Leia o Risk Premium de cada jogador',
                  'Insira as freqs do solver',
                  'Leia a coluna Δ — negativo = comprimir',
                ].map((step, i) => (
                  <li key={i} style={{ fontSize: '0.75rem', color: 'var(--sim-text-muted)', lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </header>

      <ReferencialAula12 />

      <div className="container" style={{ marginTop: '1rem' }}>
        <SimuladorICM />
      </div>

    </main>
  );
}
