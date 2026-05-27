import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized, notFound } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const task = await prisma.aiTask.findUnique({
    where: { id },
    include: { results: true, model: { select: { name: true, provider: true } } },
  });

  if (!task) return notFound("任务不存在");
  if (task.userId !== user.userId && user.role !== "admin") return unauthorized();

  return ok({
    id: task.id,
    status: task.status,
    prompt: task.prompt,
    creditsCost: task.creditsCost,
    errorMsg: task.errorMsg,
    model: task.model,
    results: task.results,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  });
}
