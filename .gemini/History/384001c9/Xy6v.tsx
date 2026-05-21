'use client';

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';

export default function DashboardPage ()
{
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
            <ContentPageHeader
                title="Dashboard Analítico"
                subtitle="Telemetria e controle central do seu progresso na Geometria do Risco."
                category="SOTA Intelligence"
                icon="fa-table-columns"
            />
            <div className="sota-container flex items-center justify-center py-24">
                <div className="glass-panel p-12 text-center max-w-lg mx-auto border-accent-indigo/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    <i className="fa-solid fa-satellite-dish text-4xl text-accent-indigo mb-6 animate-pulse" />
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">Módulo em Calibração</h2>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        A infraestrutura de telemetria SOTA está processando os dados locais. Este painel central será ativado em breve.
                    </p>
                </div>
            </div>
        </div>
    );
}
