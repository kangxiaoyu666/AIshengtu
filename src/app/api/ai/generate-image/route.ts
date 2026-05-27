import { NextRequest, NextResponse } from 'next/server';
import { deductPoints, refundPoints, logGenerate, getOrCreatePoints } from '@/lib/db';

/**
 * POST /api/ai/generate-image
 * 用户消耗点数生成 AI 图片
 * 流程：检查余额 → 扣点 → 调用AI → 成功确认 / 失败返还
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, prompt, model } = await req.json();
    if (!userId || !prompt) return NextResponse.json({ error: '缺少参数' }, { status: 400 });

    const pointsCost = model === 'deep' ? 5 : 2;

    // 1. 检查余额
    const balance = getOrCreatePoints(userId);
    if (balance.balancePoints < pointsCost) {
      return NextResponse.json({ error: '点数不足', balance: balance.balancePoints, required: pointsCost }, { status: 402 });
    }

    // 2. 扣除点数 + 写流水
    const deductResult = deductPoints(userId, pointsCost, `AI生图: ${prompt.slice(0, 50)}`);
    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 402 });
    }

    // 3. 调用 AI 生成（此处通过 chat API 实现）
    try {
      const apiKey = process.env.LLM_API_KEY || '';
      const baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
      const modelName = process.env.LLM_MODEL || 'gpt-4o';

      if (!apiKey) {
        // 模拟生成（无API Key时）
        logGenerate({ userId, prompt, model: model || 'default', pointsCost, status: 'success', result: '模拟生成结果' });
        return NextResponse.json({
          success: true,
          balance: deductResult.balance,
          response: `AI 已处理你的请求：${prompt}`,
          pointsCost,
        });
      }

      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({ apiKey, baseURL });

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: '你是一个AI图像处理助手。请根据用户描述生成/编辑图片的建议。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';

      logGenerate({ userId, prompt, model: modelName, pointsCost, status: 'success', result: response });

      return NextResponse.json({
        success: true,
        balance: deductResult.balance,
        response,
        pointsCost,
      });
    } catch (aiError: any) {
      // 4. 失败返还点数
      refundPoints(userId, pointsCost, `AI生成失败返还: ${prompt.slice(0, 30)}`);
      logGenerate({ userId, prompt, model: model || 'default', pointsCost, status: 'failed' });

      return NextResponse.json({
        error: 'AI生成失败，点数已返还',
        balance: getOrCreatePoints(userId).balancePoints,
      }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
