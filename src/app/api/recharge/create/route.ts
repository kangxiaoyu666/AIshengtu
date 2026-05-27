import { NextRequest, NextResponse } from 'next/server';
import { createRechargeOrder, getPaymentChannelByCode } from '@/lib/db';
import { createNativeOrder, generateOutTradeNo } from '@/lib/wechatpay';
import { createAlipayOrder } from '@/lib/alipay';
import { getConfig } from '@/lib/cms-config';

// 套餐配置 - 前后端统一数据源
const RECHARGE_PACKAGES = [
  { id: 'pkg1', points: 100,  price: 9.9,   amountCent: 990 },
  { id: 'pkg2', points: 500,  price: 39.9,  amountCent: 3990 },
  { id: 'pkg3', points: 1200, price: 79.9,  amountCent: 7990 },
  { id: 'pkg4', points: 3000, price: 169.9, amountCent: 16990 },
  { id: 'pkg5', points: 8000, price: 399.9, amountCent: 39990 },
  { id: 'pkg6', points: 20000,price: 899.9, amountCent: 89990 },
];

export async function POST(req: NextRequest) {
  try {
    const { userId, packageId, payChannel } = await req.json();
    
    if (!userId || !packageId) {
      return NextResponse.json({ error: '缺少参数 userId/packageId' }, { status: 400 });
    }

    // 从CMS或默认套餐表查询套餐，不信任前端传的price/points
    const cmsConfig = getConfig();
    const allPackages = cmsConfig.rechargePackages?.length ? cmsConfig.rechargePackages : RECHARGE_PACKAGES;
    const pkg = allPackages.find((p: any) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: '套餐不存在' }, { status: 400 });
    }
    
    const points = pkg.points;
    const price = pkg.price;
    const amountCent = Math.round(price * 100);
    
    const channel = payChannel || 'wechat';
    
    // 验证支付渠道是否启用
    const channelConfig = getPaymentChannelByCode(channel);
    if (channelConfig && channelConfig.status !== 'enabled') {
      return NextResponse.json({ error: `支付渠道 ${channel} 未启用` }, { status: 400 });
    }
    
    const outTradeNo = generateOutTradeNo();
    
    // 创建订单（后端确定的金额和点数）
    createRechargeOrder({ userId, outTradeNo, amountCent, points });
    
    let result: any;
    
    if (channel === 'alipay') {
      result = await createAlipayOrder({
        outTradeNo,
        subject: `造境 AI-${points}点充值`,
        totalAmount: price,
        notifyUrl: channelConfig?.notifyUrl || '',
      });
    } else {
      result = await createNativeOrder({
        outTradeNo,
        description: `造境 AI-${points}点充值`,
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
