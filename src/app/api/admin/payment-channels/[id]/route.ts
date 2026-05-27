import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized, notFound } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

/** PUT: 更新渠道 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const { id } = await params;
  const existing = await prisma.paymentChannelConfig.findUnique({ where: { id } });
  if (!existing) return notFound();

  const data = await req.json();
  const updated = await prisma.paymentChannelConfig.update({
    where: { id },
    data: {
      channelName: data.channelName ?? existing.channelName,
      appId: data.appId ?? existing.appId,
      merchantId: data.merchantId ?? existing.merchantId,
      gatewayUrl: data.gatewayUrl ?? existing.gatewayUrl,
      notifyUrl: data.notifyUrl ?? existing.notifyUrl,
      returnUrl: data.returnUrl ?? existing.returnUrl,
      configJson: data.configJson ?? existing.configJson,
      status: data.status ?? existing.status,
    },
  });

  // 脱敏
  let safeConfig = "{}";
  try {
    const parsed = JSON.parse(updated.configJson);
    safeConfig = JSON.stringify({
      apiV3Key: parsed.apiV3Key ? "****" : "",
      privateKey: parsed.privateKey ? "****" : "",
      certSerialNo: parsed.certSerialNo || "",
      alipayPublicKey: parsed.alipayPublicKey ? "****" : "",
    });
  } catch {}

  return ok({ ...updated, configJson: safeConfig });
}
