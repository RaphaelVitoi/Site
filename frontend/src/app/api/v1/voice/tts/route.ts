import { NextResponse } from 'next/server';
import { CorpoExcedeLimiteError, lerCorpoComLimite } from '@/lib/server/limited-body';
import { resolverCorrelationId } from '@/lib/server/visitor-id';
import {
  buildVoiceUpstreamSignal,
  checkVoiceTtsRateLimit,
  DEFAULT_TTS_STYLE_PROMPT,
  resolveVoiceNexusUrl,
  VOICE_NAME_RX,
} from '@/lib/server/voice-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TTS_BODY_BYTES = 16_384;
const MAX_TTS_TEXT_CHARS = 2_000;
const MAX_STYLE_PROMPT_CHARS = 400;

interface TtsRequestBody {
  text?: unknown;
  voice?: unknown;
  rate?: unknown;
  style_prompt?: unknown;
}

interface UpstreamTtsResponse {
  ok?: unknown;
  audioBase64?: unknown;
  format?: unknown;
  voice?: unknown;
  tier?: unknown;
  error?: unknown;
}

function resolveClientIpKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'local';
}

interface ParsedTtsPayload {
  text: string;
  voice: string;
  rate: number;
  style_prompt: string;
}

async function readTtsBody(
  request: Request,
  headers: Record<string, string>,
): Promise<{ rawBody: string } | { errorResponse: NextResponse }> {
  try {
    return { rawBody: await lerCorpoComLimite(request, MAX_TTS_BODY_BYTES) };
  } catch (error) {
    if (error instanceof CorpoExcedeLimiteError) {
      return {
        errorResponse: NextResponse.json(
          { ok: false, error: 'Payload TTS excede o limite de 16 KB.' },
          { status: 413, headers },
        ),
      };
    }
    return {
      errorResponse: NextResponse.json(
        { ok: false, error: 'Falha ao ler corpo da requisição TTS.' },
        { status: 400, headers },
      ),
    };
  }
}

function parseTtsPayload(
  rawBody: string,
  headers: Record<string, string>,
): { payload: ParsedTtsPayload } | { errorResponse: NextResponse } {
  let parsed: TtsRequestBody;
  try {
    const json = JSON.parse(rawBody || '{}') as unknown;
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new TypeError('JSON inválido');
    }
    parsed = json as TtsRequestBody;
  } catch {
    return {
      errorResponse: NextResponse.json(
        { ok: false, error: 'JSON inválido na requisição TTS.' },
        { status: 400, headers },
      ),
    };
  }

  const text = typeof parsed.text === 'string' ? parsed.text.trim() : '';
  if (!text || text.length > MAX_TTS_TEXT_CHARS) {
    return {
      errorResponse: NextResponse.json(
        {
          ok: false,
          error: `O texto para síntese deve ter entre 1 e ${MAX_TTS_TEXT_CHARS} caracteres.`,
        },
        { status: 400, headers },
      ),
    };
  }

  let voice = 'Kore';
  if (parsed.voice !== undefined) {
    if (typeof parsed.voice !== 'string' || !VOICE_NAME_RX.test(parsed.voice.trim())) {
      return {
        errorResponse: NextResponse.json(
          { ok: false, error: 'Identificador de voz inválido.' },
          { status: 400, headers },
        ),
      };
    }
    voice = parsed.voice.trim();
  }

  const rawRate = typeof parsed.rate === 'number' && Number.isFinite(parsed.rate) ? parsed.rate : 1.25;
  const rate = Math.min(2.0, Math.max(0.5, rawRate));
  const rawStyle =
    typeof parsed.style_prompt === 'string' && parsed.style_prompt.trim().length > 0
      ? parsed.style_prompt.trim()
      : DEFAULT_TTS_STYLE_PROMPT;

  return {
    payload: {
      text,
      voice,
      rate,
      style_prompt: rawStyle.slice(0, MAX_STYLE_PROMPT_CHARS),
    },
  };
}

function projectUpstreamTtsResponse(upstreamJson: UpstreamTtsResponse | null) {
  return {
    ok: Boolean(upstreamJson?.ok),
    ...(typeof upstreamJson?.audioBase64 === 'string' ? { audioBase64: upstreamJson.audioBase64 } : {}),
    ...(typeof upstreamJson?.format === 'string' ? { format: upstreamJson.format } : {}),
    ...(typeof upstreamJson?.voice === 'string' ? { voice: upstreamJson.voice } : {}),
    ...(typeof upstreamJson?.tier === 'string' ? { tier: upstreamJson.tier } : {}),
    ...(typeof upstreamJson?.error === 'string' ? { error: upstreamJson.error } : {}),
  };
}

function isTimeoutError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'TimeoutError') ||
    (error instanceof Error && error.name === 'TimeoutError')
  );
}

/**
 * Proxy seguro (BFF) para síntese neural Voice Nexus (`:9333/api/voice/tts`).
 * Impõe limite de corpo (16 KB), rate-limit em memória, validação de voz/texto
 * e propagação de cancelamento/timeout via AbortSignal.any/timeout.
 */
export async function POST(request: Request) {
  const requestId = resolverCorrelationId(request);
  const headers = { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };

  if (!checkVoiceTtsRateLimit(resolveClientIpKey(request))) {
    return NextResponse.json(
      { ok: false, error: 'Limite de requisições de síntese atingido.' },
      { status: 429, headers: { ...headers, 'Retry-After': '60' } },
    );
  }

  const bodyResult = await readTtsBody(request, headers);
  if ('errorResponse' in bodyResult) {
    return bodyResult.errorResponse;
  }

  const parsedResult = parseTtsPayload(bodyResult.rawBody, headers);
  if ('errorResponse' in parsedResult) {
    return parsedResult.errorResponse;
  }

  try {
    const upstreamSignal = buildVoiceUpstreamSignal(request.signal, 6_000);
    const upstreamRes = await fetch(`${resolveVoiceNexusUrl()}/api/voice/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(parsedResult.payload),
      ...(upstreamSignal ? { signal: upstreamSignal } : {}),
      cache: 'no-store',
    });

    const upstreamJson = (await upstreamRes.json().catch(() => null)) as UpstreamTtsResponse | null;
    return NextResponse.json(projectUpstreamTtsResponse(upstreamJson), {
      status: upstreamRes.status,
      headers,
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      return NextResponse.json(
        { ok: false, error: 'Voice Nexus TTS: tempo limite excedido.' },
        { status: 504, headers },
      );
    }
    return NextResponse.json({ ok: false, error: 'Voice Nexus TTS: serviço indisponível.' }, { status: 503, headers });
  }
}
