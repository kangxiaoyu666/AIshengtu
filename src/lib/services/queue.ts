/**
 * QueueService — 异步任务队列
 * 开发环境：内存队列 + 定时轮询
 * 生产可替换为 Redis/BullMQ
 */
import { prisma } from "@/lib/prisma";
import { ImageGenerationService, GenerateParams } from "./imagegen";
import { CreditService } from "./credit";

type QueueJob = {
  taskId: string;
  userId: string;
  modelId: string;
  params: GenerateParams;
  creditsCost: number;
};

class InMemoryQueue {
  private jobs: QueueJob[] = [];
  private running = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  /** 入队 */
  enqueue(job: QueueJob) {
    this.jobs.push(job);
    this.ensurePolling();
  }

  /** 确保轮询运行 */
  private ensurePolling() {
    if (this.interval) return;
    this.interval = setInterval(() => this.processNext(), 2000);
  }

  /** 处理下一个任务 */
  private async processNext() {
    if (this.running || this.jobs.length === 0) return;
    this.running = true;
    const job = this.jobs.shift()!;

    try {
      // 更新状态为 running
      await prisma.aiTask.update({
        where: { id: job.taskId },
        data: { status: "running", startedAt: new Date() },
      });

      // 调用 AI 生成
      const results = await ImageGenerationService.generate(job.modelId, job.params);

      // 保存结果
      for (const r of results) {
        await prisma.aiTaskResult.create({
          data: {
            taskId: job.taskId,
            url: r.url,
            width: r.width,
            height: r.height,
            seed: r.seed,
          },
        });
      }

      // 确认扣除点数
      await CreditService.consume(job.userId, job.creditsCost, job.taskId);

      // 更新任务状态为成功
      await prisma.aiTask.update({
        where: { id: job.taskId },
        data: { status: "succeeded", completedAt: new Date(), creditsFrozen: false },
      });

      // 保存作品
      for (const r of results) {
        await prisma.artwork.create({
          data: {
            userId: job.userId,
            taskId: job.taskId,
            prompt: job.params.prompt,
            url: r.url,
            width: r.width,
            height: r.height,
          },
        });
      }
    } catch (e: any) {
      // 失败：返还点数
      await CreditService.unfreeze(job.userId, job.creditsCost, job.taskId);
      await prisma.aiTask.update({
        where: { id: job.taskId },
        data: { status: "failed", errorMsg: e.message, completedAt: new Date(), creditsFrozen: false },
      });
    } finally {
      this.running = false;
    }
  }

  /** 停止轮询 */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// 全局单例
const globalQueue = globalThis as unknown as { __queue: InMemoryQueue };
const queue = globalQueue.__queue || new InMemoryQueue();
if (process.env.NODE_ENV !== "production") globalQueue.__queue = queue;

export class QueueService {
  /** 提交任务 */
  static async submit(taskId: string) {
    const task = await prisma.aiTask.findUnique({
      where: { id: taskId },
      include: { model: true },
    });
    if (!task) throw new Error("任务不存在");
    if (task.status !== "created") throw new Error(`任务状态不允许: ${task.status}`);

    let params: GenerateParams;
    try { params = JSON.parse(task.paramsJson); } catch { params = { prompt: task.prompt }; }
    params.prompt = task.prompt;
    if (task.negativePrompt) params.negativePrompt = task.negativePrompt;

    // 更新为 queued
    await prisma.aiTask.update({ where: { id: taskId }, data: { status: "queued" } });

    // 入队
    queue.enqueue({
      taskId: task.id,
      userId: task.userId,
      modelId: task.modelId || "model-default",
      params,
      creditsCost: task.creditsCost,
    });
  }

  /** 获取队列长度（开发用） */
  static getQueueLength(): number {
    return (queue as any).jobs?.length || 0;
  }
}
