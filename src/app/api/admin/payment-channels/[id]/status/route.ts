import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized, notFound } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";
import { PaymentService } from "@/lib/payment";

/** POST: 切换渠道启用/禁用 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const { id } = await params;
  const { status } = await req.json();

  if (!status || !["enabled", "disabled"].includes(status)) {
    return fail("status 必须为 enabled 或 disabled");
  }

  const channel = await prisma.paymentChannelConfig.findUnique({ where: { id } });
  if (!channel) return notFound();

  // 启用时校验配置完整性（mock 渠道例外）
  if (status === "enabled" && channel.channelCode !== "mock") {
    const adapter = PaymentService.getAdapter(channel.channelCode as any);
    if (!adapter) return fail(`未知渠道: ${channel.channelCode}`);

    if (!adapter.isMock && !adapter.canEnable(channel as any)) {
      return fail(`渠道 ${channel.channelName} 配置不完整，无法启用。请检查 appId、merchantId 和密钥配置。`);
    }
  }

  const updated = await prisma.paymentChannelConfig.update({
    where: { id },
    data: { status },
  });

  return ok({ id: updated.id, channelCode: updated.channelCode, status: updated.status });
}
