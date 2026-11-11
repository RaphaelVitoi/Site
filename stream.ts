import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const result = streamText({
  model: google('gemini-3.8-flash'),
  prompt: 'Invent a new holiday and describe its traditions.',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
console.log();
