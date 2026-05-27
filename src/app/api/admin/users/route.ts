import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser } from '@/lib/user-store';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const users = getAllUsers();
    return NextResponse.json({ users, total: users.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const body = await req.json();
    const { id, action, value } = body;

    if (!id || !action) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    let success = false;

    switch (action) {
      case 'status':
        success = updateUserStatus(id, value);
        break;
      case 'role':
        success = updateUserRole(id, value);
        break;
      default:
        return NextResponse.json({ error: '无效操作' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const success = deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
