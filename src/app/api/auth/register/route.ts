import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/response";
import { signToken } from "@/lib/auth";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "zaojing-salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return fail("请填写所有字段");
    if (password.length < 6) return fail("密码至少6位");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("该邮箱已注册");

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword(password), role: "user" },
    });

    // 创建点数账户
    await prisma.creditAccount.create({ data: { userId: user.id, balance: 10 } });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = await signToken(payload);

    const resp = ok({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    resp.cookies.set("zj_token", token, {
      httpOnly: true, secure: false, sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, path: "/",
    });

    return resp;
  } catch (e: any) {
    return fail(e.message || "注册失败", 500);
  }
}
