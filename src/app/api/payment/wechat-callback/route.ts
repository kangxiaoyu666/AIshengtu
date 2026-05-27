import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyCallbackSignature } from '@/lib/wechatpay';

/**
 * 微信支付回调通知
 * POST /api/payment/wechat-callback
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // 获取微信签名头
    const timestamp = req.headers.get('wechatpay-timestamp') || '';
    const nonce = req.headers.get('wechatpay-nonce') || '';
    const signature = req.headers.get('wechatpay-signature') || '';
    const serial = req.headers.get('wechatpay-serial') || '';

    console.log('[微信支付回调] 收到通知');
    console.log('[微信支付回调] timestamp:', timestamp);
    console.log('[微信支付回调] nonce:', nonce);

    // 验证签名
    const isValid = verifyCallbackSignature(timestamp, nonce, body, signature);

    if (!isValid) {
      console.error('[微信支付回调] 签名验证失败');
      return NextResponse.json({ code: 'FAIL', message: '签名验证失败' }, { status: 401 });
    }

    // 解析回调数据
    const callbackData = JSON.parse(body);
    const { out_trade_no, transaction_id, trade_state, amount } = callbackData;

    console.log('[微信支付回调] 订单号:', out_trade_no);
    console.log('[微信支付回调] 交易号:', transaction_id);
    console.log('[微信支付回调] 状态:', trade_state);
    console.log('[微信支付回调] 金额:', amount);

    if (trade_state === 'SUCCESS') {
      // 支付成功，保存到订单文件
      const orderPath = `/tmp/jiaotu_orders.json`;
      const fs = await import('fs');
      let orders: any[] = [];

      try {
        if (fs.existsSync(orderPath)) {
          orders = JSON.parse(fs.readFileSync(orderPath, 'utf-8'));
        }
      } catch {}

      // 检查是否已处理
      const existing = orders.find((o: any) => o.out_trade_no === out_trade_no);
      if (existing) {
        console.log('[微信支付回调] 订单已处理:', out_trade_no);
        return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
      }

      orders.push({
        out_trade_no,
        transaction_id,
        trade_state,
        amount: amount?.total || 0,
        paid_at: new Date().toISOString(),
        callback_raw: callbackData,
      });

      fs.writeFileSync(orderPath, JSON.stringify(orders));

      console.log('[微信支付回调] 订单处理成功:', out_trade_no);
    }

    // 返回成功应答（必须返回此格式）
    return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
  } catch (error: any) {
    console.error('[微信支付回调] 处理失败:', error);
    return NextResponse.json(
      { code: 'FAIL', message: error.message || '处理失败' },
      { status: 500 }
    );
  }
}
