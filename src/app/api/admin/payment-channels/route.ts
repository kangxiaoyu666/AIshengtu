import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

/** GET: 获取所有支付渠道（脱敏） */
export async function GET(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const channels = await prisma.paymentChannelConfig.findMany();

  // 脱敏：不返回密钥明文
  const sanitized = channels.map((c) => {
    let configJson = "{}";
    try {
      const parsed = JSON.parse(c.configJson);
      configJson = JSON.stringify({
        apiV3Key: parsed.apiV3Key ? "****" : "",
        privateKey: parsed.privateKey ? "****" : "",
        certSerialNo: parsed.certSerialNo || "",
        alipayPublicKey: parsed.alipayPublicKey ? "****" : "",
      });
    } catch {}

    return { ...c, configJson };
  });

  return ok(sanitized);
}

/** POST: 创建或更新支付渠道 */
export async function POST(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const data = await req.json();
  if (!data.channelCode) return fail("缺少 channelCode");

  const existing = await prisma.paymentChannelConfig.findUnique({
    where: { channelCode: data.channelCode },
  });

  const channel = existing
    ? await prisma.paymentChannelConfig.update({
        where: { channelCode: data.channelCode },
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
      })
    : await prisma.paymentChannelConfig.create({ data });

  // 脱敏返回
  let safeConfig = "{}";
  try {
    const parsed = JSON.parse(channel.configJson);
    safeConfig = JSON.stringify({
      apiV3Key: parsed.apiV3Key ? "****" : "",
      privateKey: parsed.privateKey ? "****" : "",
      certSerialNo: parsed.certSerialNo || "",
      alipayPublicKey: parsed.alipayPublicKey ? "****" : "",
    });
  } catch {}

  return ok({ ...channel, configJson: safeConfig });
}
