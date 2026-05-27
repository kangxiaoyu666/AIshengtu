import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/response";
import { signToken, setAuthCookie } from "@/lib/auth";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "zaojing-salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return fail("请填写邮箱和密码");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail("用户不存在", 401);

    if (user.password !== hashPassword(password)) return fail("密码错误", 401);
    if (user.status === "banned") return fail("账号已封禁", 403);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = await signToken(payload);

    const resp = ok({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    // Set cookie
    resp.cookies.set("zj_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return resp;
  } catch (e: any) {
    return fail(e.message || "登录失败", 500);
  }
}
