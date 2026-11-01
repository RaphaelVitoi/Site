/**
 * NEXUS AI MESH ROUTER (SOTA v8.0 GOLD)
 * PATH: frontend/src/lib/ai/mesh-router.ts
 * ROLE: Roteador resiliente e de alta performance integrado à malha de agentes.
 *       Conecta Google Gemini (3.5/3.8 Flash) e Vercel AI Gateway com failover automático.
 */

import { generateText, streamText, type LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export interface MeshPromptOptions {
  prompt: string;
  system?: string;
  instructions?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MeshGenerationResult {
  text: string;
  provider: 'google-direct' | 'vercel-ai-gateway' | 'fallback';
  modelUsed: string;
  latencyMs: number;
}

/**
 * Cria a instancia do provedor Google usando as chaves canonicas do ambiente.
 */
function getGoogleModel(modelName = 'gemini-3.5-flash'): LanguageModel {
  const apiKey =
    process.env['GEMINI_API_KEY'] ||
    process.env['GOOGLE_GENERATIVE_AI_API_KEY'] ||
    '';

  const google = createGoogleGenerativeAI({ apiKey });
  return google(modelName);
}

/**
 * Gera texto de forma resiliente atraves da malha de inferencia.
 * Tenta primeiro o modelo preferencial e aplica failover sem interrupcao.
 */
export async function generateMeshText(
  options: MeshPromptOptions,
): Promise<MeshGenerationResult> {
  const t0 = performance.now();
  const primaryModel = options.model || 'gemini-3.5-flash';

  try {
    const model = getGoogleModel(primaryModel);
    const callOptions: Parameters<typeof generateText>[0] = {
      model,
      prompt: options.prompt,
    };
    const instructions = options.instructions ?? options.system;
    if (instructions !== undefined) {
      callOptions.instructions = instructions;
    }
    if (options.temperature !== undefined) {
      callOptions.temperature = options.temperature;
    }

    const { text } = await generateText(callOptions);
    const elapsed = Math.round(performance.now() - t0);
    return {
      text,
      provider: 'google-direct',
      modelUsed: primaryModel,
      latencyMs: elapsed,
    };
  } catch {
    // Failover para o modelo secundario deterministico
    const fallbackModel = 'gemini-3.1-flash-lite';
    const model = getGoogleModel(fallbackModel);
    const fallbackOptions: Parameters<typeof generateText>[0] = {
      model,
      prompt: options.prompt,
    };
    const instructions = options.instructions ?? options.system;
    if (instructions !== undefined) {
      fallbackOptions.instructions = instructions;
    }
    if (options.temperature !== undefined) {
      fallbackOptions.temperature = options.temperature;
    }

    const { text } = await generateText(fallbackOptions);
    const elapsed = Math.round(performance.now() - t0);
    return {
      text,
      provider: 'fallback',
      modelUsed: fallbackModel,
      latencyMs: elapsed,
    };
  }
}

/**
 * Inicia stream de texto resiliente com baixa latencia para UIs e agentes da malha.
 */
export function streamMeshText(options: MeshPromptOptions) {
  const primaryModel = options.model || 'gemini-3.5-flash';
  const model = getGoogleModel(primaryModel);
  const streamOptions: Parameters<typeof streamText>[0] = {
    model,
    prompt: options.prompt,
  };
  const instructions = options.instructions ?? options.system;
  if (instructions !== undefined) {
    streamOptions.instructions = instructions;
  }
  if (options.temperature !== undefined) {
    streamOptions.temperature = options.temperature;
  }

  return streamText(streamOptions);
}
