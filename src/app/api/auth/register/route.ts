import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少需要6位' }, { status: 400 });
    }

    const result = registerUser(name, email, password);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { passwordHash, ...user } = result as any;
    return NextResponse.json({ user, token: 'token-' + user.id });
  } catch {
    return NextResponse.json({ error: '注册失败' }, { status: 500 });
  }
}
