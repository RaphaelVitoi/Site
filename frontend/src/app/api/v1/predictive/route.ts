import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { logger } from '@/lib/logger';
import { isOperatorEmail } from '@/lib/server/operator';

/**
 * IDENTITY: Perfil preditivo e telemetria de quem pergunta
 * PATH: src/app/api/v1/predictive/route.ts
 *
 * FE-03 (auditoria 2026-09-17). Esta rota devolvia a qualquer visitante um perfil de vieses FIXO
 * (`'Aversão ao Risco': 0.85`, …) — ou esse mesmo fixo levemente modulado pela taxa de erro — e a
 * interface o exibia como diagnóstico pessoal. O backend também só tem um perfil GLOBAL
 * (`predictive_profile.json`), treinado com os dados do operador.
 *
 * Contrato agora:
 * - `profile` só existe quando corresponde a quem pergunta: o modelo global, para o operador.
 *   Para qualquer outra conta é `null` — não há modelo individual, e inventar um não é fallback.
 * - `telemetry` são as decisões gravadas pela própria sessão. Sem sessão, lista vazia.
 * - `source` diz de onde veio cada coisa, para a interface declarar o que é medição.
 */

export type PredictiveSource = 'nexus-operador' | 'sem-modelo-individual' | 'sem-sessao' | 'indisponivel';

const ASCII_PARA_UTF8: Record<string, string> = {
	'Aversao ao Risco': 'Aversão ao Risco',
	'Excesso de Agressao': 'Excesso de Agressão',
};

async function perfilDoOperador(): Promise<Record<string, number> | null> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 800);
	try {
		const headers: Record<string, string> = {};
		const credencial = process.env['API_SECRET_TOKEN'];
		if (credencial) headers['Authorization'] = `Bearer ${credencial}`;
		const res = await fetch(buildNexusServerUrl('/predictive-profile'), {
			signal: controller.signal,
			cache: 'no-store',
			headers,
		});
		if (!res.ok) return null;
		const data: unknown = await res.json();
		const bruto = (data as { profile?: unknown } | null)?.profile;
		if (typeof bruto !== 'object' || bruto === null) return null;
		const perfil: Record<string, number> = {};
		for (const [chave, valor] of Object.entries(bruto as Record<string, unknown>)) {
			if (typeof valor === 'number' && Number.isFinite(valor)) perfil[ASCII_PARA_UTF8[chave] ?? chave] = valor;
		}
		return Object.keys(perfil).length > 0 ? perfil : null;
	} catch {
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

export async function GET() {
	const session = await auth();
	const userId = session?.user?.id;
	if (!userId) {
		return NextResponse.json({ profile: null, telemetry: [], source: 'sem-sessao' satisfies PredictiveSource });
	}

	try {
		const events = await prisma.telemetryEvent.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: 50,
		});
		const telemetry = events.map((e: { evLoss: number | null; isCorrect: boolean; createdAt: Date }) => ({
			evLoss: e.evLoss ?? 0,
			isCorrect: e.isCorrect,
			createdAt: e.createdAt,
		}));

		if (isOperatorEmail(session.user?.email)) {
			const profile = await perfilDoOperador();
			return NextResponse.json({
				profile,
				telemetry,
				source: (profile ? 'nexus-operador' : 'indisponivel') satisfies PredictiveSource,
			});
		}

		return NextResponse.json({ profile: null, telemetry, source: 'sem-modelo-individual' satisfies PredictiveSource });
	} catch (error) {
		logger.error('API:Predictive', 'Falha ao consultar telemetria', { error });
		return NextResponse.json({ profile: null, telemetry: [], source: 'indisponivel' satisfies PredictiveSource });
	}
}
