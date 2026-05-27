import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { messages, model: modelOverride, mode } = await req.json();
    const apiKey = process.env.LLM_API_KEY || '';
    const baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    const model = modelOverride || process.env.LLM_MODEL || 'gpt-4o';

    if (!apiKey) {
      return NextResponse.json({ error: '请在 .env.local 中配置 LLM_API_KEY' }, { status: 500 });
    }

    const client = new OpenAI({ apiKey, baseURL });

    const isDeep = mode === 'deep';
    const systemPrompt = {
      role: 'system' as const,
      content: `你是一个专业的AI图像处理助手。${isDeep ? '请进行深度分析和详细处理。' : '请快速高效地处理用户请求。'}
支持的操作：换背景、抠图、虚拟换装、照片修复、高清放大、扩图、证件照制作、海报生成、电商设计、风格迁移、去水印、消除路人等。
请以专业、友好的语气回复用户。`,
    };

    const completion = await client.chat.completions.create({
      model,
      messages: [systemPrompt, ...messages],
      max_tokens: isDeep ? 4000 : 2000,
      temperature: isDeep ? 0.5 : 0.8,
    });

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || '处理请求时出错' }, { status: 500 });
  }
}
