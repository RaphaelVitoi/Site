import DashboardSOTA from "@/components/simulator/DashboardSOTA";
import { SotaProvider } from "@/components/simulator/SotaContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laboratório Quântico | Poker Racional",
  description: "Distorção ICM e Telemetria de Perspectiva",
};

export default function LaboratorioV2Page() {
  return (
    <main className="min-h-screen bg-bg-deep text-slate-200 p-6 lg:p-12 font-sans selection:bg-accent-indigo selection:text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="border-b border-white/5 pb-8">
          <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-2">
            Laboratório <span className="text-accent-indigo">Quântico</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">
            Telemetria de Perspectiva & Distorção ICM Dinâmica
          </p>
        </header>

        <SotaProvider>
          <DashboardSOTA />
        </SotaProvider>
      </div>
    </main>
  );
}
