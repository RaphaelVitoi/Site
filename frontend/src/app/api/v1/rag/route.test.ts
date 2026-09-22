/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/api-contract', () => ({
  buildNexusServerUrl: (path: string) => new URL(path, 'http://127.0.0.1:17042').toString(),
}));
jest.mock('@/lib/logger', () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

import { auth } from '@/auth';
import { POST } from './route';

describe('API RAG: composição System-1 + LLM', () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env['GEMINI_API_KEY'];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env['GEMINI_API_KEY'] = 'test-key';
    (auth as jest.Mock).mockResolvedValue({ user: { email: 'operator@example.com' } });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env['GEMINI_API_KEY'];
    else process.env['GEMINI_API_KEY'] = originalKey;
  });

  it('compõe o advisory Laya antes da síntese Gemini', async () => {
    const signal = {
      idioma: 'multilingual',
      script: 'latin',
      nao_latin_fraction_pct: 0,
      provenia: { engine_id: 'heuristic-script-detector', implementation_level: 'simulation', weights_loaded: false },
    };
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'SUCCESS', answer: 'base local', system1: signal })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'resposta composta' }] } }] })),
      );

    const response = await POST(
      new Request('http://localhost/api/v1/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Como comparar as linhas?' }),
      }),
    );
    const body = await response.json();
    const geminiCall = (globalThis.fetch as jest.Mock).mock.calls[1] as [string, RequestInit];
    const geminiBody = JSON.parse(String(geminiCall[1].body)) as { system_instruction: { parts: { text: string }[] } };

    expect(response.status).toBe(200);
    expect(body.answer).toBe('resposta composta');
    expect(geminiBody.system_instruction.parts[0]?.text).toContain('System-1 advisory');
    expect(geminiBody.system_instruction.parts[0]?.text).toContain('weights_loaded=false');
  });

  it('não chama o LLM quando o sinal System-1 local não está disponível', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'SUCCESS', answer: 'base local', system1: null })));
    const response = await POST(
      new Request('http://localhost/api/v1/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Como comparar as linhas?' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.context).toBe('base local');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
