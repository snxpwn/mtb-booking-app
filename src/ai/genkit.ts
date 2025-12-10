
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY;
console.log('Genkit Init: API Key presence (in server component context):', !!apiKey);

if (!apiKey) {
    console.error('GEMINI_API_KEY is not set. Google AI features will fail.');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey
  })],
  model: 'googleai/gemini-2.0-flash',
});
