import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const orderPath = '/tmp/jiaotu_orders.json';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outTradeNo = searchParams.get('out_trade_no');

  try {
    let orders: any[] = [];
    if (fs.existsSync(orderPath)) {
      orders = JSON.parse(fs.readFileSync(orderPath, 'utf-8'));
    }

    if (outTradeNo) {
      const order = orders.find((o: any) => o.out_trade_no === outTradeNo);
      return NextResponse.json({
        paid: !!order,
        order: order || null,
      });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
