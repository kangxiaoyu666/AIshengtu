import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, status: true, avatar: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Attach credit balances
  const withBalances = await Promise.all(
    users.map(async (u) => {
      const account = await prisma.creditAccount.findUnique({ where: { userId: u.id } });
      return { ...u, credits: account?.balance || 0 };
    })
  );

  return ok(withBalances);
}

export async function PATCH(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const { id, status, role } = await req.json();
  if (!id) return fail("缺少用户ID");

  const data: Record<string, string> = {};
  if (status) data.status = status;
  if (role) data.role = role;

  await prisma.user.update({ where: { id }, data });
  return ok({ updated: true });
}
