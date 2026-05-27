import { NextRequest, NextResponse } from 'next/server';
import { verifyCallbackSignature } from '@/lib/wechatpay';
import { getOrderByOutTradeNo, markOrderPaid } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const ts = req.headers.get('wechatpay-timestamp') || '';
    const nonce = req.headers.get('wechatpay-nonce') || '';
    const sig = req.headers.get('wechatpay-signature') || '';

    if (!verifyCallbackSignature(ts, nonce, rawBody, sig)) {
      return NextResponse.json({ code: 'FAIL', message: '签名失败' }, { status: 401 });
    }

    const notifyData = JSON.parse(rawBody);
    const outTradeNo = notifyData.out_trade_no;
    const txId = notifyData.transaction_id;
    const state = notifyData.trade_state;
    const amt = notifyData.amount?.total;

    const order = getOrderByOutTradeNo(outTradeNo);
    if (!order) return NextResponse.json({ code: 'FAIL', message: '订单不存在' }, { status: 404 });
    if (order.status === 'paid') return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
    if (state !== 'SUCCESS') return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
    if (amt && amt !== order.amountCent) return NextResponse.json({ code: 'FAIL', message: '金额不一致' }, { status: 400 });

    markOrderPaid(outTradeNo, txId);
    console.log('[回调] ✅ 支付成功:', outTradeNo, '+', order.points, '点');
    return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
  } catch (e: any) {
    return NextResponse.json({ code: 'FAIL', message: e.message }, { status: 500 });
  }
}
