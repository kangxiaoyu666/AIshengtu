import { LLMConfig } from '@/types';

export const defaultLLMConfig: LLMConfig = {
  apiKey: process.env.LLM_API_KEY || 'sk-your-api-key',
  baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.LLM_MODEL || 'gpt-4o',
};

export const availableModels = [
  { id: 'gpt-4o', name: 'GPT-4o', description: '最强综合能力' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '快速轻量' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '视觉理解强' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: '细节精准' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '多模态强' },
];
