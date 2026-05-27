import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

const ORDERS_PATH = '/tmp/jiaotu_orders.json';

// 模拟充值记录（结合真实订单+模拟数据）
const mockRecords = [
  { id:'tx-1', user:'张三', email:'zhangsan@qq.com', amount:500, price:39.9, method:'wechat', status:'success', desc:'微信充值 500点', time:'2026-05-27 10:30:00' },
  { id:'tx-2', user:'李四', email:'lisi@qq.com', amount:100, price:9.9, method:'alipay', status:'success', desc:'支付宝充值 100点', time:'2026-05-27 09:15:00' },
  { id:'tx-3', user:'王五', email:'wangwu@qq.com', amount:1200, price:79.9, method:'wechat', status:'success', desc:'微信充值 1200点', time:'2026-05-26 16:45:00' },
  { id:'tx-4', user:'测试用户', email:'test@test.com', amount:500, price:39.9, method:'wechat', status:'failed', desc:'微信充值 500点（失败）', time:'2026-05-26 14:20:00' },
  { id:'tx-5', user:'赵六', email:'zhaoliu@qq.com', amount:3000, price:169.9, method:'alipay', status:'success', desc:'支付宝充值 3000点', time:'2026-05-26 11:00:00' },
  { id:'tx-6', user:'张三', email:'zhangsan@qq.com', amount:8000, price:399.9, method:'wechat', status:'success', desc:'微信充值 8000点', time:'2026-05-25 20:00:00' },
];

export async function GET(req: NextRequest) {
  try {
    // Read real orders from file
    let realOrders: any[] = [];
    try {
      if (fs.existsSync(ORDERS_PATH)) {
        realOrders = JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'));
      }
    } catch {}

    // Build records
    const allRecords = [...mockRecords];
    
    // Add real orders
    realOrders.forEach((o: any) => {
      allRecords.unshift({
        id: o.out_trade_no,
        user: '微信用户',
        email: '-',
        amount: (o.amount || 0) / 10, // approximate
        price: (o.amount || 0) / 100,
        method: 'wechat',
        status: o.trade_state === 'SUCCESS' ? 'success' : 'pending',
        desc: `微信支付 ${o.out_trade_no}`,
        time: o.paid_at || o.callback_raw?.create_time || '-',
      });
    });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const method = searchParams.get('method') || 'all';
    const status = searchParams.get('status') || 'all';

    let filtered = allRecords;
    if (search) filtered = filtered.filter((r) => r.user.includes(search) || r.email.includes(search));
    if (method !== 'all') filtered = filtered.filter((r) => r.method === method);
    if (status !== 'all') filtered = filtered.filter((r) => r.status === status);

    // Stats
    const totalRevenue = allRecords.filter(r => r.status === 'success').reduce((s, r) => s + r.price, 0);
    const totalPoints = allRecords.filter(r => r.status === 'success').reduce((s, r) => s + r.amount, 0);

    return NextResponse.json({
      records: filtered,
      total: filtered.length,
      stats: { totalRevenue, totalPoints, totalRecords: allRecords.length },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
