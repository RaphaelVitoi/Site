import 'server-only';

import { isLoopbackOrHttps } from '@/lib/chrysalis';

export const DEFAULT_VOICE_NEXUS_URL = 'http://127.0.0.1:9333';

export const DEFAULT_TTS_STYLE_PROMPT =
  'Explicação técnica e didática de teoria dos jogos, poker de alta performance e cálculo de equidade com fluência natural.';

export const VOICE_NAME_RX = /^[A-Za-z0-9_-]{1,32}$/;

const ttsBuckets = new Map<string, number[]>();

export function resolveVoiceNexusUrl(): string {
  const raw = process.env['VOICE_NEXUS_URL']?.trim();
  if (!raw || !isLoopbackOrHttps(raw)) {
    return DEFAULT_VOICE_NEXUS_URL;
  }
  let end = raw.length;
  while (end > 0 && raw[end - 1] === '/') {
    end -= 1;
  }
  return end === raw.length ? raw : raw.slice(0, end);
}

export function checkVoiceTtsRateLimit(clientKey: string, limit = 30, windowMs = 60_000, now = Date.now()): boolean {
  if (ttsBuckets.size > 1_000) {
    for (const [key, stamps] of ttsBuckets.entries()) {
      const fresh = stamps.filter((ts) => now - ts < windowMs);
      if (fresh.length === 0) {
        ttsBuckets.delete(key);
      } else {
        ttsBuckets.set(key, fresh);
      }
    }
  }

  const key = clientKey.trim() || 'local';
  const existing = ttsBuckets.get(key) ?? [];
  const active = existing.filter((ts) => now - ts < windowMs);
  if (active.length >= limit) {
    ttsBuckets.set(key, active);
    return false;
  }
  active.push(now);
  ttsBuckets.set(key, active);
  return true;
}

export function buildVoiceUpstreamSignal(userSignal?: AbortSignal, timeoutMs = 6_000): AbortSignal | undefined {
  const hasTimeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function';
  if (!hasTimeout) {
    return userSignal;
  }
  const deadline = AbortSignal.timeout(timeoutMs);
  if (userSignal && typeof AbortSignal.any === 'function') {
    return AbortSignal.any([userSignal, deadline]);
  }
  return userSignal ?? deadline;
}
