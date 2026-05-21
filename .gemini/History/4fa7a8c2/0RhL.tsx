'use client';
import MasterSimulatorDynamic from '@/components/simulator/MasterSimulatorDynamic';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Motor ICM | Poker Racional',
    description: 'Simulador Mestre de ICM e Distorções GTO',
};

export default function MotorPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' }}>

            {/* Header Central de Página */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
                            letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Motor ICM
                        </h1>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
                            Laboratório interativo de Risk Premium. Simule spots, calcule a Perspectiva Matemática e visualize o Downward Drift na prática.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '0.35rem 0.75rem', borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                                Laboratório
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                Interativo SOTA
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href="/" style={{
                            padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
                            fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.65rem' }}></i> Início
                        </Link>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
                <MasterSimulatorDynamic />
            </div>
        </div>
    );
}
