import { NextRequest, NextResponse } from 'next/server';
import { createNativeOrder, generateOutTradeNo } from '@/lib/wechatpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { points, price, description } = body;

    if (!points || !price) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const outTradeNo = generateOutTradeNo();

    const result = await createNativeOrder({
      outTradeNo,
      description: description || `造境 AI充值 ${points}点`,
      amount: {
        total: Math.round(price * 100), // 元转分
        currency: 'CNY',
      },
    });

    return NextResponse.json({
      ...result,
      outTradeNo,
      points,
      price,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '创建订单失败' }, { status: 500 });
  }
}
