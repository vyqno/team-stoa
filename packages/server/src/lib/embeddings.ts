import { InferenceClient } from "@huggingface/inference";

let client: InferenceClient | null = null;

function getClient(): InferenceClient {
  if (!client) {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error("HF_TOKEN environment variable is required");
    client = new InferenceClient(token);
  }
  return client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const hf = getClient();
  const model = process.env.HF_EMBEDDING_MODEL || "nomic-ai/nomic-embed-text-v1.5";
  const provider = process.env.HF_PROVIDER || "hf-inference";
  const dimensions = Number(process.env.EMBEDDING_DIMENSIONS || "768");

  const result = await hf.featureExtraction({
    model,
    inputs: text,
    provider: provider as "hf-inference",
  });

  const embedding = Array.isArray(result) ? (result as number[]) : Array.from(result as number[]);

  if (embedding.length !== dimensions) {
    throw new Error(
      `Embedding dimension mismatch: expected ${dimensions}, got ${embedding.length}`,
    );
  }

  return embedding;
}

export async function generateServiceEmbedding(service: {
  name: string;
  description: string;
  capabilities: string[];
}): Promise<number[]> {
  const text = [service.name, service.description, ...service.capabilities].join(" ");
  return generateEmbedding(text);
}
