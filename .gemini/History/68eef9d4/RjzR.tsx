// frontend/src/app/laboratorio-v2/gto-cfr/page.tsx
'use client';

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { Suspense } from 'react';
import { GtoCfrContent } from './GtoCfrContent';

export default function GtoCfrDashboard ()
{
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="GTO & CFR SOTA"
        subtitle="Integração da Teoria de Sistemas com A* Geometric Sizing e Regret Matching."
        category="Laboratório"
        icon="fa-network-wired"
      />
      <Suspense fallback={ <div className="p-12 text-center text-text-muted">Carregando Malha Geométrica...</div> }>
        <GtoCfrContent />
      </Suspense>
    </div>
  );
}
