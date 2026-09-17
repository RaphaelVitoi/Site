'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

/**
 * Entrada e saída de sessão no Header.
 *
 * FE-01 (auditoria 2026-09-17): nenhum ponto da interface levava ao login. Os recursos que exigem
 * sessão (Gemma, RAG, busca web, telemetria) existiam sem caminho de acesso.
 */
export function HeaderAuthAction({ isLightPage }: Readonly<{ isLightPage: boolean }>) {
	const { data: session, status } = useSession();
	if (status === 'loading') return null;

	const classe = `hidden text-[0.65rem] font-black tracking-[0.2em] uppercase transition-colors sm:inline ${
		isLightPage ? 'text-light-text-muted hover:text-light-text-main' : 'text-text-muted hover:text-white'
	}`;

	if (session) {
		return (
			<button type="button" className={classe} onClick={() => void signOut({ redirectTo: '/' })}>
				Sair
			</button>
		);
	}

	return (
		<Link href="/login" className={classe}>
			Entrar
		</Link>
	);
}
