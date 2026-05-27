import { NextRequest, NextResponse } from 'next/server';
import { createRechargeOrder, getPaymentChannelByCode } from '@/lib/db';
import { createNativeOrder, generateOutTradeNo } from '@/lib/wechatpay';
import { createAlipayOrder } from '@/lib/alipay';

export async function POST(req: NextRequest) {
  try {
    const { userId, points, price, payChannel } = await req.json();
    if (!userId || !points || !price) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }
    
    const channel = payChannel || 'wechat';
    
    // 验证支付渠道是否启用
    const channelConfig = getPaymentChannelByCode(channel);
    if (!channelConfig || channelConfig.status !== 'enabled') {
      // 测试模式下降级处理
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Test] Payment channel ${channel} not enabled, using test mode`);
      } else {
        return NextResponse.json({ error: `支付渠道 ${channel} 未启用` }, { status: 400 });
      }
    }
    
    const amountCent = Math.round(price * 100);
    const outTradeNo = generateOutTradeNo();
    
    // 创建订单
    createRechargeOrder({ userId, outTradeNo, amountCent, points });
    
    let result: any;
    
    if (channel === 'alipay') {
      result = await createAlipayOrder({
        outTradeNo,
        subject: `椒图AI-${points}点充值`,
        totalAmount: price,
        notifyUrl: channelConfig?.notifyUrl || '',
      });
    } else {
      // 默认微信支付
      result = await createNativeOrder({
        outTradeNo,
        description: `椒图AI-${points}点充值`,
        amount: { total: amountCent, currency: 'CNY' },
      }, channelConfig ? { channelConfig: { appId: channelConfig.appId, merchantId: channelConfig.merchantId, notifyUrl: channelConfig.notifyUrl, configJson: channelConfig.configJson } } : undefined);
    }
    
    if (!result.success) {
      return NextResponse.json({ error: result.error || '创建支付失败' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      orderNo: outTradeNo,
      codeUrl: result.codeUrl,
      payChannel: channel,
      testMode: result.testMode || false,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
