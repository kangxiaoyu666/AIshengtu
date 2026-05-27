/**
 * 服务端数据存储层
 * 基于 JSON 文件，模拟数据库操作
 * 
 * 表结构：
 * - users:          用户表
 * - user_points:    点数账户表
 * - recharge_orders:充值订单表
 * - point_logs:     点数流水表
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = '/tmp/jiaotu_data';

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }

function readTable<T>(name: string): T[] {
  ensureDir();
  const f = path.join(DATA_DIR, `${name}.json`);
  try { if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8')); }
  catch {}
  return [];
}

function writeTable<T>(name: string, data: T[]): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

// ==================== Types ====================

export interface UserRow {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'designer' | 'admin';
  status: 'active' | 'banned' | 'pending';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPointsRow {
  userId: string;
  balancePoints: number;
  totalRecharged: number;  // 累计充值点数
  totalSpent: number;       // 累计消费点数
  totalRechargedAmount: number; // 累计充值金额（元）
  updatedAt: string;
}

export interface RechargeOrderRow {
  id: string;
  userId: string;
  outTradeNo: string;        // 商户订单号
  amountCent: number;        // 金额（分）
  points: number;            // 充值点数
  status: 'pending' | 'paid' | 'closed' | 'refunded';
  wechatTransactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointLogRow {
  id: string;
  userId: string;
  changePoints: number;      // 正数=增加，负数=扣除
  type: 'recharge' | 'generate_image' | 'refund' | 'manual';
  relatedOrderId?: string;
  remark: string;
  createdAt: string;
}

export interface GenerateLogRow {
  id: string;
  userId: string;
  prompt: string;
  model: string;
  pointsCost: number;
  status: 'success' | 'failed';
  result?: string;
  createdAt: string;
}

// ==================== User Points ====================

export function getOrCreatePoints(userId: string): UserPointsRow {
  const rows = readTable<UserPointsRow>('user_points');
  let row = rows.find(r => r.userId === userId);
  if (!row) {
    row = { userId, balancePoints: 0, totalRecharged: 0, totalSpent: 0, totalRechargedAmount: 0, updatedAt: new Date().toISOString() };
    rows.push(row);
    writeTable('user_points', rows);
  }
  return row;
}

export function addPoints(userId: string, points: number, type: 'recharge' | 'refund' | 'manual', relatedOrderId?: string, remark?: string): UserPointsRow {
  const rows = readTable<UserPointsRow>('user_points');
  let row = rows.find(r => r.userId === userId);
  if (!row) row = { userId, balancePoints: 0, totalRecharged: 0, totalSpent: 0, totalRechargedAmount: 0, updatedAt: '' };

  row.balancePoints += points;
  if (type === 'recharge') {
    row.totalRecharged += points;
  }
  row.updatedAt = new Date().toISOString();

  // Write point log
  const logs = readTable<PointLogRow>('point_logs');
  logs.push({
    id: 'plog-' + Date.now(),
    userId,
    changePoints: points,
    type,
    relatedOrderId,
    remark: remark || (type === 'recharge' ? '充值到账' : type === 'refund' ? '退款返还' : '手动调整'),
    createdAt: new Date().toISOString(),
  });
  writeTable('point_logs', logs);

  if (rows.find(r => r.userId === userId)) {
    const idx = rows.findIndex(r => r.userId === userId);
    rows[idx] = row;
  } else {
    rows.push(row);
  }
  writeTable('user_points', rows);

  return row;
}

export function deductPoints(userId: string, points: number, remark: string): { success: boolean; balance: number; error?: string } {
  const rows = readTable<UserPointsRow>('user_points');
  let row = rows.find(r => r.userId === userId);
  if (!row) return { success: false, balance: 0, error: '账户不存在' };
  if (row.balancePoints < points) return { success: false, balance: row.balancePoints, error: '点数不足' };

  row.balancePoints -= points;
  row.totalSpent += points;
  row.updatedAt = new Date().toISOString();

  // Write point log
  const logs = readTable<PointLogRow>('point_logs');
  logs.push({
    id: 'plog-' + Date.now(),
    userId,
    changePoints: -points,
    type: 'generate_image',
    remark,
    createdAt: new Date().toISOString(),
  });
  writeTable('point_logs', logs);

  const idx = rows.findIndex(r => r.userId === userId);
  rows[idx] = row;
  writeTable('user_points', rows);

  return { success: true, balance: row.balancePoints };
}

export function refundPoints(userId: string, points: number, remark: string): void {
  const rows = readTable<UserPointsRow>('user_points');
  let row = rows.find(r => r.userId === userId);
  if (!row) return;
  row.balancePoints += points;
  row.totalSpent -= points;
  row.updatedAt = new Date().toISOString();

  const logs = readTable<PointLogRow>('point_logs');
  logs.push({
    id: 'plog-' + Date.now(),
    userId, changePoints: points, type: 'refund', remark,
    createdAt: new Date().toISOString(),
  });
  writeTable('point_logs', logs);

  const idx = rows.findIndex(r => r.userId === userId);
  rows[idx] = row;
  writeTable('user_points', rows);
}

// ==================== Recharge Orders ====================

export function createRechargeOrder(params: {
  userId: string; outTradeNo: string; amountCent: number; points: number;
}): RechargeOrderRow {
  const orders = readTable<RechargeOrderRow>('recharge_orders');
  const order: RechargeOrderRow = {
    id: 'ord-' + Date.now(),
    userId: params.userId,
    outTradeNo: params.outTradeNo,
    amountCent: params.amountCent,
    points: params.points,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  writeTable('recharge_orders', orders);
  return order;
}

export function getOrderByOutTradeNo(outTradeNo: string): RechargeOrderRow | null {
  return readTable<RechargeOrderRow>('recharge_orders').find(o => o.outTradeNo === outTradeNo) || null;
}

export function markOrderPaid(outTradeNo: string, wechatTransactionId: string): RechargeOrderRow | null {
  const orders = readTable<RechargeOrderRow>('recharge_orders');
  const idx = orders.findIndex(o => o.outTradeNo === outTradeNo);
  if (idx === -1) return null;
  if (orders[idx].status === 'paid') return orders[idx]; // 幂等

  orders[idx].status = 'paid';
  orders[idx].wechatTransactionId = wechatTransactionId;
  orders[idx].paidAt = new Date().toISOString();
  orders[idx].updatedAt = new Date().toISOString();
  writeTable('recharge_orders', orders);

  // 加点数 + 写流水
  addPoints(orders[idx].userId, orders[idx].points, 'recharge', orders[idx].id,
    `微信充值 ${orders[idx].amountCent / 100} 元`);

  return orders[idx];
}

export function getAllOrders(): RechargeOrderRow[] {
  return readTable<RechargeOrderRow>('recharge_orders').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUserOrders(userId: string): RechargeOrderRow[] {
  return readTable<RechargeOrderRow>('recharge_orders').filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ==================== Point Logs ====================

export function getAllPointLogs(): PointLogRow[] {
  return readTable<PointLogRow>('point_logs').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUserPointLogs(userId: string): PointLogRow[] {
  return readTable<PointLogRow>('point_logs').filter(l => l.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ==================== Payment Channel Config ====================

export interface PaymentChannelConfigRow {
  id: string;
  channelCode: string;       // wechat / alipay
  channelName: string;        // 微信支付 / 支付宝
  appId: string;
  merchantId: string;
  gatewayUrl: string;
  notifyUrl: string;
  returnUrl: string;
  configJson: string;         // JSON string with encrypted keys
  status: 'enabled' | 'disabled';
  createdAt: string;
  updatedAt: string;
}


export function getAllPaymentChannels(): PaymentChannelConfigRow[] {
  return readTable<PaymentChannelConfigRow>('payment_channels');
}

export function getPaymentChannelByCode(code: string): PaymentChannelConfigRow | null {
  return readTable<PaymentChannelConfigRow>('payment_channels').find(c => c.channelCode === code) || null;
}

export function savePaymentChannel(data: Partial<PaymentChannelConfigRow> & { channelCode: string }): PaymentChannelConfigRow {
  const channels = readTable<PaymentChannelConfigRow>('payment_channels');
  const existing = channels.findIndex(c => c.channelCode === data.channelCode);
  const now = new Date().toISOString();
  
  const row: PaymentChannelConfigRow = {
    id: data.id || ('pc-' + Date.now()),
    channelCode: data.channelCode,
    channelName: data.channelName || '',
    appId: data.appId || '',
    merchantId: data.merchantId || '',
    gatewayUrl: data.gatewayUrl || '',
    notifyUrl: data.notifyUrl || '',
    returnUrl: data.returnUrl || '',
    configJson: data.configJson || '{}',
    status: data.status || 'disabled',
    createdAt: existing >= 0 ? channels[existing].createdAt : now,
    updatedAt: now,
  };
  
  if (existing >= 0) {
    channels[existing] = row;
  } else {
    channels.push(row);
  }
  writeTable('payment_channels', channels);
  return row;
}

export function updatePaymentChannelStatus(code: string, status: 'enabled' | 'disabled'): boolean {
  const channels = readTable<PaymentChannelConfigRow>('payment_channels');
  const idx = channels.findIndex(c => c.channelCode === code);
  if (idx === -1) return false;
  channels[idx].status = status;
  channels[idx].updatedAt = new Date().toISOString();
  writeTable('payment_channels', channels);
  return true;
}

// Initialize default payment channels
function ensurePaymentChannels() {
  const channels = readTable<PaymentChannelConfigRow>('payment_channels');
  if (!channels.find(c => c.channelCode === 'wechat')) {
    channels.push({
      id: 'pc-wechat', channelCode: 'wechat', channelName: '微信支付',
      appId: '', merchantId: '', gatewayUrl: 'https://api.mch.weixin.qq.com',
      notifyUrl: '', returnUrl: '', configJson: '{}',
      status: 'disabled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }
  if (!channels.find(c => c.channelCode === 'alipay')) {
    channels.push({
      id: 'pc-alipay', channelCode: 'alipay', channelName: '支付宝',
      appId: '', merchantId: '', gatewayUrl: 'https://openapi.alipay.com',
      notifyUrl: '', returnUrl: '', configJson: '{}',
      status: 'disabled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }
  writeTable('payment_channels', channels);
}
ensurePaymentChannels();

// ==================== Generate Logs ====================

export function logGenerate(params: {
  userId: string; prompt: string; model: string; pointsCost: number; status: 'success' | 'failed'; result?: string;
}) {
  const logs = readTable<GenerateLogRow>('generate_logs');
  logs.push({ ...params, id: 'gen-' + Date.now(), createdAt: new Date().toISOString() });
  writeTable('generate_logs', logs);
}

export function getAllGenerateLogs(): GenerateLogRow[] {
  return readTable<GenerateLogRow>('generate_logs').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
