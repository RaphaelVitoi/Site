'use client';

/**
 * IDENTITY: GTO AI & CFR Laboratory
 * PATH: src/app/simulador/gto-cfr/page.tsx
 * ROLE: Laboratório SOTA demonstrando Regret Matching e Sizing Geométrico.
 * PRINCIPLE: Honestidade Intelectual & Densidade Máxima.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GtoCfrContent } from '@/components/simulator/GtoCfrContent';
import { SotaHubNavbar } from '@/components/simulator/SotaHubNavbar';

export default function GtoCfrLabPage ()
{
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <SotaHubNavbar />

      <ContentPageHeader
        title="Laboratório GTO AI"
        subtitle="Modelagem Matemática Pura: Sizing Geométrico (A*) e Regret Matching (CFR)."
        category="Simulação Avançada"
        icon="fa-brain"
      />

      <div className="sota-container space-y-16">
        <GtoCfrContent />
      </div>
    </div>
  );
}
