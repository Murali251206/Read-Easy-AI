/**
 * Ollama AI Configuration
 * Base URL and model are loaded dynamically from environment variables,
 * with intelligent fallbacks.
 */
export const OLLAMA_CONFIG = {
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3",
  timeoutMs: 60000, // 60 seconds timeout
};
