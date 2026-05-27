import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";
import { CreditService } from "@/lib/services/credit";
import { QueueService } from "@/lib/services/queue";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();

    const { prompt, modelId, negativePrompt, params } = await req.json();
    if (!prompt) return fail("缺少提示词");

    // 获取模型配置
    const model = modelId
      ? await prisma.aiModel.findUnique({ where: { id: modelId } })
      : await prisma.aiModel.findFirst({ where: { status: "active" }, orderBy: { priority: "desc" } });
    if (!model) return fail("无可用模型");

    const creditsCost = model.pointsPerUse * (params?.count || 1);

    // 1. 创建任务 (status=created)
    const task = await prisma.aiTask.create({
      data: {
        userId: user.userId,
        modelId: model.id,
        type: "text2img",
        prompt,
        negativePrompt: negativePrompt || "",
        paramsJson: JSON.stringify(params || {}),
        status: "created",
        creditsCost,
      },
    });

    // 2. 冻结点数
    try {
      await CreditService.freeze(user.userId, creditsCost, task.id);
      await prisma.aiTask.update({ where: { id: task.id }, data: { creditsFrozen: true } });
    } catch (e: any) {
      await prisma.aiTask.update({ where: { id: task.id }, data: { status: "blocked", errorMsg: e.message } });
      return fail(e.message, 402);
    }

    // 3. 提交到异步队列
    QueueService.submit(task.id).catch((e) => console.error("[Queue] submit error:", e));

    return ok({
      taskId: task.id,
      status: task.status,
      creditsCost,
      message: "任务已提交，正在排队处理",
    });
  } catch (e: any) {
    return fail(e.message || "提交失败", 500);
  }
}
