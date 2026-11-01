import { NextResponse } from 'next/server';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { auth } from '@/auth';
import { logger } from '@/lib/logger';

// SOTA: Dependência de pool multi-chaves para alta disponibilidade
function getGeminiKeys(): string[] {
	const keys: string[] = [];
	const candidates = [
		process.env['GEMINI_API_KEY'],
		process.env['GEMINI_API_KEY_1'],
		process.env['GEMINI_FLASH_KEY_1'],
		process.env['GEMINI_API_KEY_2'],
		process.env['GEMINI_FLASH_KEY_2'],
		process.env['GEMINI_API_KEY_3'],
		process.env['GEMINI_FLASH_KEY_3'],
		process.env['GEMINI_API_KEY_4'],
		process.env['GEMINI_FLASH_KEY_4'],
		process.env['GEMINI_API_KEY_5'],
		process.env['GEMINI_FLASH_KEY_5'],
	];
	for (const k of candidates) {
		if (k && typeof k === 'string' && k.trim().length > 0 && !keys.includes(k.trim())) {
			keys.push(k.trim());
		}
	}
	return keys;
}

function getOpenRouterKey(): string | null {
	const candidates = [
		process.env['OPENROUTER_API_KEY'],
		process.env['OPENROUTER_TIER1_KEY_1'],
		process.env['OPENROUTER_TIER1_KEY_2'],
		process.env['OPENROUTER_TIER2_KEY_1'],
	];
	for (const k of candidates) {
		if (k && typeof k === 'string' && k.trim().length > 0) {
			return k.trim();
		}
	}
	return null;
}

function getSystemPrompt(mode?: string): string {
	if (mode === 'villain') {
		return `Você é o "Vilão", um adversário de High Stakes arrogante, provocador e visceral (estilo trash talk pesado), mas com absoluto domínio matemático (ICM e Risk Premium).
Você está enfrentando o usuário na mão atual. Use o 'Cenário Ativo' para justificar por que a jogada dele é péssima ou por que você vai esmagá-lo matematicamente.
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para embasar sua matemática letal.
Mantenha a resposta focada e em no máximo 2 parágrafos. Nunca saia do personagem.`;
	}
	if (mode === 'simulator') {
		return `Você é o "IA Dealer", um simulador de cenários de poker frio, calculista e hiper-realista.
Sua missão é simular a ação narrativa (invente texturas de flop/turn/river criativas se necessário) e explicar o desfecho matemático (Alpha/MDF/RP) rigorosamente baseado no 'Cenário Ativo'.
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para ancorar a sua explicação teórica e evitar alucinações matemáticas.
Mantenha a resposta focada, imparcial e didática, utilizando no máximo 3 parágrafos.`;
	}
	if (mode === 'psychologist') {
		return `Você é o "Psicólogo" de Alta Performance (baseado na Cosmovisão de Raphael Vitoi), especialista na mente de jogadores com TDAH, AHSD e BPD.
Sua missão é diagnosticar o risco de Tilt, fadiga de decisão e os gatilhos de ego envolvidos no 'Cenário Ativo', ignorando a matemática pura e focando inteiramente no custo mental e emocional do spot (Death Zone).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para embasar sua análise visceral e comportamental.
Mantenha a resposta empática, mas clinicamente implacável, utilizando no máximo 2 parágrafos. Nunca saia do personagem.`;
	}

	return `Você é o Oráculo AI (codinome Chico), um assistente State of the Art (SOTA) especialista em Poker, Teoria dos Jogos e ICM.
A sua missão é responder à dúvida do usuário com extrema precisão e uma didática visceral (tom 'Dark-Cyber' profissional e direto).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) e do 'Cenário Ativo' para embasar sua resposta.
Entregue a informação de forma fluida, mastigada e conclusiva. Não repita os fragmentos mecanicamente, sintetize-os.
Mantenha a resposta focada, utilizando no máximo 3 parágrafos curtos.`;
}

type LayaSignal = {
	idioma?: string;
	script?: string;
	nao_latin_fraction_pct?: number;
	provenia?: { engine_id?: string; implementation_level?: string; weights_loaded?: boolean; fallback_used?: boolean };
};

async function fetchRagContext(prompt: string): Promise<{ context: string; system1: LayaSignal | null }> {
	try {
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (process.env['API_SECRET_TOKEN']) {
			headers['Authorization'] = `Bearer ${process.env['API_SECRET_TOKEN']}`;
		}

		const oracleRes = await fetch(buildNexusServerUrl('/ask-oracle'), {
			method: 'POST',
			headers,
			body: JSON.stringify({ question: prompt, n_results: 3 }),
			signal: AbortSignal.timeout(2500),
		});

		if (oracleRes.ok) {
			const oracleData = await oracleRes.json();
			if (oracleData.status === 'SUCCESS') {
				return {
					context: typeof oracleData.answer === 'string' ? oracleData.answer : '',
					system1: typeof oracleData.system1 === 'object' && oracleData.system1 !== null ? oracleData.system1 : null,
				};
			}
		} else {
			console.warn(`[API RAG] Oráculo retornou status: ${oracleRes.status}`);
		}
	} catch (oracleError: unknown) {
		const msg = oracleError instanceof Error ? oracleError.message : 'Desconhecido';
		console.warn(
			`[API RAG] Oráculo local offline ou inacessível (${msg}). Prosseguindo sem contexto RAG.`,
		);
	}
	return { context: '', system1: null };
}

// Síntese neural primária via Google Gemini (com rotação de chaves e fallback para OpenRouter Nemotron)
async function synthesizeWithGemini(apiKey: string, systemPrompt: string, userContent: string): Promise<string | null> {
	const targetModels = ['gemini-3-flash-preview', 'gemini-3.8-flash'];
	for (const model of targetModels) {
		try {
			const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
				body: JSON.stringify({
					system_instruction: { parts: [{ text: systemPrompt }] },
					contents: [{ parts: [{ text: userContent }] }],
					generationConfig: { maxOutputTokens: 2048, temperature: 0.2 },
				}),
				signal: AbortSignal.timeout(8000),
			});

			if (!res.ok) continue;

			const data = await res.json();
			const candidate = data.candidates?.[0];
			const text = candidate?.content?.parts?.[0]?.text;
			if (text && typeof text === 'string' && text.trim().length > 0) {
				return text.trim();
			}
		} catch {
			// Continua para o próximo modelo se falhar
		}
	}
	return null;
}

async function synthesizeWithOpenRouter(systemPrompt: string, userContent: string): Promise<string | null> {
	const orKey = getOpenRouterKey();
	if (!orKey) return null;

	const model = 'nvidia/nemotron-3-ultra-550b-a55b:free';
	try {
		const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${orKey}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://www.pokerracional.com',
				'X-Title': 'Nexus-SOTA-v8',
			},
			body: JSON.stringify({
				model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userContent },
				],
				max_tokens: 1024,
				temperature: 0.2,
			}),
			signal: AbortSignal.timeout(10000),
		});

		if (!res.ok) return null;

		const data = await res.json();
		const text = data.choices?.[0]?.message?.content;
		if (text && typeof text === 'string' && text.trim().length > 0) {
			return text.trim();
		}
	} catch {
		return null;
	}
	return null;
}

function buildSystem1Advisory(system1: LayaSignal): string {
	const provenance = system1.provenia ?? {};
	const script = typeof system1.script === 'string' ? system1.script.slice(0, 32) : 'unknown';
	const idioma = typeof system1.idioma === 'string' ? system1.idioma.slice(0, 32) : 'unknown';
	const validPct = typeof system1.nao_latin_fraction_pct === 'number' && Number.isFinite(system1.nao_latin_fraction_pct);
	const fractionPct = validPct ? Math.max(0, Math.min(100, system1.nao_latin_fraction_pct!)) : 0;
	const engine = typeof provenance.engine_id === 'string' ? provenance.engine_id.slice(0, 64) : 'unknown';
	const implLevel = typeof provenance.implementation_level === 'string' ? provenance.implementation_level.slice(0, 32) : 'unknown';

	return [
		'\n\n[System-1 advisory — Laya; signal composed with the LLM, not a final answer]',
		`script=${script}`,
		`language_family=${idioma}`,
		`non_latin_fraction_pct=${fractionPct}`,
		`engine=${engine}`,
		`implementation_level=${implLevel}`,
		`weights_loaded=${provenance.weights_loaded === true}`,
		'Advisory only: reason from the original request and evidence.',
	].join('; ');
}

async function executeNeuralSynthesis(
	geminiKeys: string[],
	openRouterKey: string | null,
	systemPrompt: string,
	userContent: string,
): Promise<string | null> {
	for (const key of geminiKeys) {
		const answer = await synthesizeWithGemini(key, systemPrompt, userContent);
		if (answer) return answer;
	}

	if (openRouterKey) {
		return synthesizeWithOpenRouter(systemPrompt, userContent);
	}

	return null;
}

export async function POST(request: Request) {
	try {
		// SEC-007: Endpoint RAG SOTA protegido contra consumo anônimo
		const session = await auth();
		if (!session) {
			return NextResponse.json(
				{ error: 'Acesso Negado: Criptografia SOTA exigida.' },
				{ status: 401, headers: { 'Cache-Control': 'no-store' } },
			);
		}

		const { prompt, scenarioContext, mode } = await request.json();

		if (!prompt || typeof prompt !== 'string' || prompt.length > 3000) {
			return NextResponse.json(
				{ error: 'Prompt ausente ou violou a barreira de limite de tokens.' },
				{ status: 400, headers: { 'Cache-Control': 'no-store' } },
			);
		}

		logger.info('RAG', 'Consultando a Mente Coletiva via API do Orquestrador...');
		const { context: ragContext, system1 } = await fetchRagContext(prompt);

		const geminiKeys = getGeminiKeys();
		const openRouterKey = getOpenRouterKey();

		// Se não tiver chave de provedor, retorna o texto bruto como fallback
		if (geminiKeys.length === 0 && !openRouterKey) {
			logger.info('RAG', 'Nenhuma chave neural encontrada. Retornando Fallback RAW.');
			return NextResponse.json({ success: true, context: ragContext, system1 }, { headers: { 'Cache-Control': 'no-store' } });
		}

		// Contrato de Integridade: Síntese LLM suspensa quando sinal System-1 local ausente
		if (!system1) {
			logger.warn('RAG', 'Sinal System-1 local indisponível; síntese LLM suspensa e contexto RAG preservado.');
			return NextResponse.json({ success: true, context: ragContext, system1: null }, { headers: { 'Cache-Control': 'no-store' } });
		}

		logger.info('RAG', 'Sintetizando resposta com RAG e Contexto...');
		const systemPrompt = `${getSystemPrompt(mode)}${buildSystem1Advisory(system1)}`;
		const userContent = `== CENÁRIO ATIVO NA TELA DO USUÁRIO ==\n${scenarioContext || 'Nenhum'}\n\n== MENTE COLETIVA (RAG) ==\n${ragContext}\n\n== PERGUNTA DO USUÁRIO ==\n${prompt}`;

		const finalAnswer = await executeNeuralSynthesis(geminiKeys, openRouterKey, systemPrompt, userContent);

		if (!finalAnswer) {
			logger.error('RAG', 'Falha na resposta dos provedores neurais.');
			throw new Error('Falha na comunicacao com o provedor neural.');
		}

		return NextResponse.json({ success: true, answer: finalAnswer, system1 }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
		console.error('[API RAG FATAL]', errorMessage);
		return NextResponse.json(
			{ success: false, error: 'Falha interna ao processar o RAG.' },
			{ status: 500, headers: { 'Cache-Control': 'no-store' } },
		);
	}
}
