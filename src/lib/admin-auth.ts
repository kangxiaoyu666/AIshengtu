/**
 * 管理员鉴权
 * 生产环境需要严格的 JWT/Session 验证
 */

import { NextRequest, NextResponse } from 'next/server';

// 简易管理 token（生产环境改为 JWT/Session）
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'jiaotu-admin-2025';

export function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  const cookie = req.cookies.get('admin_token')?.value;
  
  return token === ADMIN_TOKEN || cookie === ADMIN_TOKEN;
}

export function requireAdmin(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: '未授权访问', code: 401 }, { status: 401 });
  }
  return null; // null means auth passed
}
