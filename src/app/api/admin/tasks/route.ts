import { NextRequest, NextResponse } from 'next/server';
import { getAllGenerateLogs } from '@/lib/db';
import { getAllUsers } from '@/lib/user-store';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const logs = getAllGenerateLogs();
    const users = getAllUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

    const tasks = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: userMap.get(log.userId)?.name || '未知用户',
      userEmail: userMap.get(log.userId)?.email || '',
      prompt: log.prompt,
      model: log.model,
      pointsCost: log.pointsCost,
      status: log.status,
      result: log.result || null,
      createdAt: log.createdAt,
      taskNo: log.id.replace('gen-', 'T'),
    }));

    return NextResponse.json({ tasks, total: tasks.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
