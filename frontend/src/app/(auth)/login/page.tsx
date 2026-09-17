/**
 * IDENTITY: Portal de Acesso
 * PATH: src/app/(auth)/login/page.tsx
 * ROLE: Casca da página de login; o conteúdo e a razão da reescrita estão em LoginContent.
 */

import { Suspense } from 'react';
import { LoginContent } from '@/components/auth/LoginContent';

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-bg-base flex items-center justify-center p-6 relative overflow-hidden font-body">
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-indigo/10 blur-[120px] rounded-full animate-pulse" />
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-emerald/5 blur-[120px] rounded-full" />

			<Suspense
				fallback={
					<div className="text-text-muted animate-pulse font-black uppercase tracking-widest">Carregando…</div>
				}
			>
				<LoginContent />
			</Suspense>
		</div>
	);
}
