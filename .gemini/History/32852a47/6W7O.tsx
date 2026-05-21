'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'discord') => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: '/simulator' });
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/10 to-transparent pointer-events-none" />

      <div className="glass-panel p-10 lg:p-14 rounded-4xl bg-bg-panel/80 backdrop-blur-2xl border border-white/10 shadow-3xl w-full max-w-md relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <i className="fa-solid fa-fingerprint text-2xl text-accent-indigo animate-pulse"></i>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Acesso SOTA</h1>
          <p className="text-[0.7rem] text-text-muted uppercase tracking-widest font-medium">Autenticação Quântica Exigida</p>
        </div>

        <div className="flex flex-col gap-5">
          <button
            onClick={() => handleLogin('google')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[0.75rem] transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50"
          >
            <i className="fa-brands fa-google text-lg"></i>
            {isLoading === 'google' ? 'Sincronizando...' : 'Entrar com Google'}
          </button>

          <button
            onClick={() => handleLogin('discord')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-[#5865F2] text-white font-black uppercase tracking-widest text-[0.75rem] transition-all hover:bg-[#4752C4] active:scale-95 disabled:opacity-50"
          >
            <i className="fa-brands fa-discord text-lg"></i>
            {isLoading === 'discord' ? 'Sincronizando...' : 'Entrar com Discord'}
          </button>
        </div>
      </div>
    </div>
  );
}
