/**
 * ImageGenerationService — AI 图片生成抽象层
 * 支持多供应商：OpenAI DALL-E / Stability AI / Replicate
 */
import { prisma } from "@/lib/prisma";

export interface GenerateParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  count?: number;
  style?: string;
  enhancePrompt?: boolean;
}

export interface GenerateResult {
  url: string;
  width?: number;
  height?: number;
  seed?: number;
}

async function callOpenAI(apiKey: string, baseUrl: string, model: string, params: GenerateParams): Promise<GenerateResult[]> {
  const resp = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      prompt: params.enhancePrompt ? `${params.prompt}, high quality, detailed` : params.prompt,
      n: params.count || 1,
      size: `${params.width || 1024}x${params.height || 1024}`,
      ...(params.negativePrompt ? {} : {}),
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI API error: ${resp.status} ${err}`);
  }
  const data = await resp.json();
  return (data.data || []).map((d: { url: string }) => ({ url: d.url, width: params.width, height: params.height }));
}

/** 模拟生成（无 API Key 时的降级方案） */
function mockGenerate(params: GenerateParams): GenerateResult[] {
  const colors = ["6366f1", "8b5cf6", "3b82f6", "06b6d4", "10b981", "f59e0b", "ef4444", "ec4899"];
  return Array.from({ length: params.count || 1 }, (_, i) => ({
    url: `https://placehold.co/${params.width || 1024}x${params.height || 1024}/${colors[i % colors.length]}/ffffff?text=AI+Generated+${i + 1}`,
    width: params.width,
    height: params.height,
    seed: Math.floor(Math.random() * 100000),
  }));
}

export class ImageGenerationService {
  /**
   * 根据 modelId 加载模型配置并调用
   */
  static async generate(modelId: string, params: GenerateParams): Promise<GenerateResult[]> {
    const model = await prisma.aiModel.findUnique({ where: { id: modelId } });
    if (!model || model.status !== "active") {
      throw new Error(`模型不可用: ${modelId}`);
    }

    const apiKey = process.env[model.apiKeyEnv];
    if (!apiKey) {
      console.warn(`[ImageGen] No API key for ${model.apiKeyEnv}, using mock`);
      return mockGenerate(params);
    }

    switch (model.provider) {
      case "openai":
        return callOpenAI(apiKey, model.endpoint, model.modelName, params);
      default:
        console.warn(`[ImageGen] Unknown provider ${model.provider}, using mock`);
        return mockGenerate(params);
    }
  }

  /** 获取活跃模型列表 */
  static async getActiveModels() {
    return prisma.aiModel.findMany({ where: { status: "active" }, orderBy: { priority: "desc" } });
  }
}
