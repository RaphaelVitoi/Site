import type { ReactNode } from 'react';

/**
 * [SERVER] Layout SOTA para o Laboratório Universal (V2).
 * Contém a topologia raiz sem envenenar a árvore com hooks de cliente.
 */
export default function LaboratorioV2Layout ( {
    children,
}: Readonly<{ children: ReactNode }> ) {
    return (
        <section className="laboratorio-v2-root min-h-screen bg-zinc-950 text-slate-200 selection:bg-fuchsia-900 selection:text-white">
            { children }
        </section>
    );
}
