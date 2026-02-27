-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index for fast semantic search on service embeddings (cosine similarity)
CREATE INDEX IF NOT EXISTS services_embedding_idx
  ON services USING hnsw (embedding vector_cosine_ops);
