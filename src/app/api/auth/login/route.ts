import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 });
    }

    const result = loginUser(email, password);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const { passwordHash, ...user } = result as any;
    return NextResponse.json({ user, token: 'token-' + user.id });
  } catch {
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
