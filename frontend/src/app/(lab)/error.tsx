'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ROUTES } from '@/constants/routes';

interface LabErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LabError({ error, reset }: Readonly<LabErrorProps>) {
  useEffect(() => {
    console.error('[LAB_BOUNDARY]', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl items-center justify-center px-6 py-16">
      <section className="glass-panel w-full rounded-3xl border border-amber-500/30 bg-slate-950/80 p-8 shadow-2xl">
        <div className="mb-4 flex items-center gap-3 text-amber-300">
          <i className="fa-solid fa-triangle-exclamation text-xl" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">Contingência do Laboratório</span>
        </div>
        <h1 className="m-0 text-2xl font-black tracking-tight text-white">Interrupção no módulo de simulação</h1>
        <p className="text-text-muted mt-3 text-sm leading-relaxed">
          O estado da simulação sofreu uma exceção de execução. Você pode recarregar o motor ou retornar ao ambiente
          principal.
        </p>
        {error.digest ? (
          <p className="text-text-muted mt-2 font-mono text-xs">
            Digest: <span className="text-white/80">{error.digest}</span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="border-accent-indigo/40 bg-accent-indigo-surface hover:bg-accent-indigo-surface-active inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold text-white transition-colors"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            <span>Reiniciar módulo</span>
          </button>
          <Link
            href={ROUTES.SIMULADOR}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            Recarregar Simulador
          </Link>
          <Link
            href={ROUTES.HOME}
            className="text-text-muted rounded-xl border border-white/10 px-4 py-2 text-xs font-medium transition-colors hover:text-white"
          >
            Início
          </Link>
        </div>
      </section>
    </main>
  );
}
