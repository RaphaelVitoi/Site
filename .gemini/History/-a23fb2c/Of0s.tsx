/**
 * IDENTITY: Rota da Calculadora ICM
 * PATH: src/app/tools/icm/page.tsx
 * ROLE: Renderizar a página pública para acesso ao simulador/calculadora de ICM (Motor Malmuth-Harville).
 * BINDING: [src/components/ICMCalculator.tsx (Componente Renderizado), src/app/layout.tsx (Layout Pai)]
 * TELEOLOGY: Atuar como porta de entrada interativa para o ecossistema, transformando prospectos em alunos por meio do encantamento técnico e visual ("Sentir a Equity").
 */

import ICMCalculator from '@/components/ICMCalculator';

export const metadata = {
    title: 'Simulador ICM | Raphael Vitoi',
    description: 'Calculadora de Equidade em Torneios (ICM) via Algoritmo de Malmuth-Harville.',
};

export default function ICMPage() {
  return (
    <main className="container" style={{ padding: '4rem 0' }}>
        <section style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-up">
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Laboratório de Teoria dos Jogos</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                Simulador de ICM
            </h1>
            <p style={{ fontStyle: 'italic', opacity: 0.8, maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
                A mecânica invisível dos torneios. Descubra o valor financeiro real da sua stack.
            </p>
        </section>

        <ICMCalculator />
    </main>
  );
}