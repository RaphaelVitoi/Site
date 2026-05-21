/**
 * IDENTITY: Rota Principal do Simulador ICM
 * PATH: frontend/src/app/tools/icm/page.tsx
 * ROLE: Ponto de entrada do laboratório visual de Valuation e Diluição
 * BINDING: [IcmSimulator]
 */

import IcmSimulator from '@/components/icm/IcmSimulator';

export default function IcmPage() {
  return (
    <main className="min-h-screen bg-black p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Simulador ICM <span className="text-zinc-500 text-lg font-normal ml-2">Valuation & Cap Table</span></h1>
        <p className="text-zinc-400 mt-2">Laboratório interativo para análise de diluição de fundadores e formação de pool de opções.</p>
      </header>
      <IcmSimulator />
    </main>
  );
}