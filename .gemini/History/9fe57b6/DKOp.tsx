/**
 * IDENTITY: MasterSimulator Page
 * PATH: src/app/tools/simulador/page.tsx
 * ROLE: Ponto de entrada para o motor interativo de Geometria do Risco.
 * BINDING: [SimuladorICM.tsx, project-context.md]
 */

import SimuladorICM from '@/components/SimuladorICM';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MasterSimulator ICM | TrueICM',
  description: 'Simulador interativo de Geometria do Risco. Calcule Risk Premium, Bubble Factor e ajustes de MDF em tempo real sob a ótica da teoria de Raphael Vitoi.',
};

export default function SimuladorPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <header className="page-header" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
        <div className="container">
          <p className="page-label">
            <span className="fa-solid fa-microchip"></span> Laboratório de Alta Performance
          </p>
          <h1 style={{
            background: 'linear-gradient(135deg, #fff 0%, #fca5a5 50%, #a5b4fc 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MasterSimulator ICM
          </h1>
          <p className="page-subtitle">
            Explore a Geometria do Risco e visualize a compressão das frequências de defesa (MDF) em tempo real.
          </p>
        </div>
      </header>

      <div className="container" style={{ marginTop: '2rem' }}>
        <SimuladorICM />
      </div>
    </main>
  );
}