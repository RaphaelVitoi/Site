/**
 * IDENTITY: Portal de Acesso (Sovereign Login)
 * PATH: src/app/login/page.tsx
 * ROLE: Autenticação SOTA para acesso às camadas protegidas (Dashboard/Simulador).
 */

"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaButton } from "@/components/ui/SotaButton";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      router.push(callbackUrl);
      setLoading(false);
    }, 800);
  };

  return (
    <GlassPanel className="max-w-md w-full p-10 border-white/5 relative z-10">
      <div className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 mb-6">
          <i className="fa-solid fa-shield-halved text-2xl text-accent-indigo-light" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
          Acesso Soberano
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Você está tentando acessar uma camada protegida do Nexus. <br />{" "}
          Identifique-se para prosseguir.
        </p>
      </div>

      <div className="space-y-4">
        <SotaButton
          variant="primary"
          fullWidth
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading ? "Sincronizando..." : "Entrar como Convidado SOTA"}
        </SotaButton>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[0.6rem] uppercase font-black tracking-widest text-text-darker bg-transparent px-2">
            Em Breve
          </div>
        </div>

        <button
          disabled
          className="w-full py-3 px-6 rounded-xl border border-white/5 bg-white/5 text-text-darker font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed opacity-50"
        >
          <i className="fa-brands fa-google opacity-50" />
          <span>Acesso via Google</span>
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[0.6rem] text-text-darker uppercase font-bold tracking-[0.2em]">
          State-of-the-Art <br /> Encryption Active
        </p>
      </div>
    </GlassPanel>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-indigo/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-emerald/5 blur-[120px] rounded-full" />

      <Suspense
        fallback={
          <div className="text-text-muted animate-pulse font-black uppercase tracking-widest">
            Iniciando Protocolo de Acesso...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
