import { createOpenAIClient } from '@trends172tech/openai';
import { EMBEDDING_MODEL } from './config';

const DEFAULT_BATCH_SIZE = 64;

export async function embedTexts(texts: string[]) {
  if (texts.length === 0) {
    return [];
  }

  const client = createOpenAIClient({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID
  });

  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += DEFAULT_BATCH_SIZE) {
    const batch = texts.slice(i, i + DEFAULT_BATCH_SIZE);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch
    });

    for (const item of response.data) {
      embeddings.push(item.embedding as number[]);
    }
  }

  return embeddings;
}
