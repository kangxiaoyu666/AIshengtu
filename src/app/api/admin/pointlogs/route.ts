import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (type) where.type = type;

  const logs = await prisma.creditTransaction.findMany({
    where,
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return ok(logs);
}
