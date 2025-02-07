import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { getEncoding } from 'js-tiktoken';
import { RecursiveCharacterTextSplitter } from './text-splitter';

// Configuration types and constants
interface OpenAIConfig extends OpenAIProviderSettings {
  baseURL?: string;
}

const DEFAULT_API_URL = 'https://api.openai.com/v1';
const MIN_CHUNK_SIZE = 140;
const DEFAULT_CONTEXT_SIZE = 128_000;

// OpenAI client configuration
const getOpenAIConfig = (): OpenAIConfig => ({
  apiKey: process.env.OPENAI_KEY!,
});

// Initialize providers
const openaiClient = createOpenAI(getOpenAIConfig());

// Model configuration
/**
 * Determines the model name based on the environment variables
 * @returns The model name to use, defaulting to 'o3-mini' if no custom endpoint or model is provided
 */
const getModelName = (): string => {
  const isCustomEndpoint = process.env.OPENAI_ENDPOINT && 
    process.env.OPENAI_ENDPOINT !== DEFAULT_API_URL;
  return (isCustomEndpoint && process.env.OPENAI_MODEL) ? 
    process.env.OPENAI_MODEL : 
    '4o-mini';
};

// Export configured model
/**
 * Creates an OpenAI model instance with the specified configuration
 * @param modelName The name of the model to use
 * @param config The configuration options for the model
 * @returns An OpenAI model instance configured with the provided parameters
 */
export const o3MiniModel = openaiClient(getModelName(), {
  reasoningEffort: 'medium',
  structuredOutputs: true,
});

// Text encoding and processing
const encoder = getEncoding('o200k_base');

const calculateChunkSize = (promptLength: number, overflowTokens: number): number => {
  // Estimate 3 characters per token
  return promptLength - (overflowTokens * 3);
};

const handleMinimumChunkSize = (prompt: string, chunkSize: number): string => {
  return chunkSize < MIN_CHUNK_SIZE ? 
    prompt.slice(0, MIN_CHUNK_SIZE) : 
    prompt;
};

const splitAndTrim = (prompt: string, chunkSize: number): string => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 0,
  });
  return splitter.splitText(prompt)[0] ?? '';
};

/**
 * Trims a prompt to fit within the specified context size
 */
export function trimPrompt(
  prompt: string,
  contextSize: number = Number(process.env.CONTEXT_SIZE) || DEFAULT_CONTEXT_SIZE
): string {
  if (!prompt) return '';

  const tokenLength = encoder.encode(prompt).length;
  if (tokenLength <= contextSize) return prompt;

  const overflowTokens = tokenLength - contextSize;
  const chunkSize = calculateChunkSize(prompt.length, overflowTokens);
  
  const processedPrompt = handleMinimumChunkSize(prompt, chunkSize);
  if (processedPrompt !== prompt) return processedPrompt;

  const trimmedPrompt = splitAndTrim(prompt, chunkSize);

  // Handle edge case where trimmed length equals original length
  if (trimmedPrompt.length === prompt.length) {
    return trimPrompt(prompt.slice(0, chunkSize), contextSize);
  }

  // Recursively trim until within context size
  return trimPrompt(trimmedPrompt, contextSize);
}