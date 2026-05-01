import { GtoCfrContent } from '@/app/simulador/gto-cfr/GtoCfrContent';

export const metadata = {
  title: 'Laboratório GTO/CFR | Poker Racional',
  description: 'Simulador interativo para convergência de Nash, Regret Matching (CFR) e A* Geometric Bet Sizing.',
};

export default function GtoCfrPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Laboratório GTO / CFR
        </h1>
        <p className="text-accent-indigo text-lg font-mono">
          Inteligência Artificial e Convergência SOTA
        </p>
      </header>
      <GtoCfrContent />
    </div>
  );
}