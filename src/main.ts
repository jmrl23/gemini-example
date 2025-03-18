import {
  GoogleGenerativeAI,
  FunctionCallingMode,
  SchemaType,
  EnhancedGenerateContentResponse,
  Part,
} from '@google/generative-ai';
import { input } from './input';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env');

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
const model = genAi.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function main() {
  const prompt = await input('> ');
  const conversation: Part[] = [{ text: prompt }];
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: conversation,
      },
    ],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
      },
    },
    tools: [
      {
        functionDeclarations: [
          {
            name: 'quote',
            description: 'Provides a quote from a famous person.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                quote: {
                  type: SchemaType.STRING,
                  description: 'The actual quote',
                },
              },
            },
          },
        ],
      },
    ],
  });

  console.log(getResults(result.response));
}

function getResults<R = Record<string, unknown>>(
  response: EnhancedGenerateContentResponse,
): R[] {
  const results: R[] = [];

  if (!response.candidates) return results;

  for (const candidates of response.candidates) {
    const result = candidates.content.parts.map((part) => ({
      ...part.functionCall?.args,
    }));
    results.push(...(result as R[]));
  }

  return results;
}

void main();
