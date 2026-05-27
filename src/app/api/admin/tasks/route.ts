import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const tasks = await prisma.aiTask.findMany({
    include: { user: { select: { email: true } }, model: { select: { name: true } }, results: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return ok(tasks);
}
