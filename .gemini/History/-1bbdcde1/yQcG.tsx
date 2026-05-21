import { UniversalLabShell } from '@/components/laboratorio/UniversalLabShell';
import type { Metadata } from 'next';

/**
 * [SERVER] Rota Raiz do Laboratório de ICM Universal (V2).
 * Metadados injetados estaticamente. Fricção Zero com o App Router.
 */
export const metadata: Metadata = {
    title: 'Laboratório de ICM Universal (V2) | Raphael Vitoi',
    description: 'Vetor de Manutenção de Monopólio e Perspectiva Matemática em tempo real. Motor Quântico O(1).',
};

export default function LaboratorioV2Page () {
    return (
        <main className="w-full max-w-300 mx-auto px-4 py-8">
            <header className="mb-8 border-b border-zinc-800 pb-4">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Laboratório de ICM Universal</h1>
                <p className="text-zinc-400 font-medium">Paradigma VITOI: Vetor de Manutenção de Monopólio (Fase 2)</p>
            </header>
            <UniversalLabShell />
        </main>
    );
}
