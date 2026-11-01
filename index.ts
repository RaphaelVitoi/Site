import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const { text } = await generateText({
  model: google('gemini-3.5-flash'),
  prompt: 'Invent a new holiday and describe its traditions.',
});

console.log(text);
