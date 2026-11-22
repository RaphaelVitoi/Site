import { config as loadEnv } from 'dotenv';
import { config, higgsfield } from '@higgsfield/client/v2';

loadEnv({ path: '.env.local' });

const MODEL_ID = 'bytedance/seedance-2.5/text-to-video';

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (typeof err === 'number' || typeof err === 'boolean' || typeof err === 'bigint' || typeof err === 'symbol') {
    return String(err);
  }
  if (err === null) return 'null';
  if (err === undefined) return 'undefined';
  if (typeof err === 'object') {
    if ('message' in err && typeof err.message === 'string' && err.message.trim().length > 0) {
      return err.message;
    }
    if ('detail' in err && typeof err.detail === 'string' && err.detail.trim().length > 0) {
      return err.detail;
    }
    try {
      return JSON.stringify(err) ?? 'unknown error';
    } catch {
      return 'unserializable error object';
    }
  }
  return 'unknown error';
}

interface SeedanceResult {
  status?: string;
  request_id?: string;
  video?: { url?: string };
  error?: unknown;
}

async function main(): Promise<void> {
  const credentials = process.env['HF_CREDENTIALS']?.trim();
  if (!credentials) {
    console.error('Missing HF_CREDENTIALS in .env.local or environment.');
    process.exitCode = 1;
    return;
  }

  config({ credentials });

  try {
    const result = (await higgsfield.subscribe(MODEL_ID, {
      input: {
        prompt: 'A cinematic scene at sunset',
        duration: 5,
        resolution: '720p',
        aspect_ratio: '16:9',
      },
      withPolling: true,
    })) as SeedanceResult;

    const status = (result.status ?? 'unknown').toLowerCase();

    if (status === 'completed') {
      const videoUrl = result.video?.url;
      if (!videoUrl) {
        console.error(`Request ${result.request_id ?? '(unknown)'} completed without a video URL.`);
        process.exitCode = 1;
        return;
      }
      console.log(videoUrl);
      return;
    }

    if (status === 'failed') {
      const failureDetail = result.error !== undefined ? formatError(result.error) : 'unknown error';
      console.error(`Request ${result.request_id ?? '(unknown)'} failed: ${failureDetail}`);
      process.exitCode = 1;
      return;
    }

    if (status === 'canceled' || status === 'cancelled') {
      console.error(`Request ${result.request_id ?? '(unknown)'} was canceled.`);
      process.exitCode = 1;
      return;
    }

    if (status === 'nsfw') {
      console.error(`Request ${result.request_id ?? '(unknown)'} was moderated (status: nsfw).`);
      process.exitCode = 1;
      return;
    }

    console.error(`Request ${result.request_id ?? '(unknown)'} ended with unexpected status: ${status}`);
    process.exitCode = 1;
  } catch (err: unknown) {
    const message = formatError(err);
    console.error(`Higgsfield request error: ${message}`);
    process.exitCode = 1;
  }
}

void main();
