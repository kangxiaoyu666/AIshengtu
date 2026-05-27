import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";
import crypto from "crypto";

const PACKAGES = [
  { id: "pkg1", credits: 100, amountCent: 990 },
  { id: "pkg2", credits: 500, amountCent: 3990 },
  { id: "pkg3", credits: 1200, amountCent: 7990 },
  { id: "pkg4", credits: 3000, amountCent: 16990 },
];

function genOutTradeNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ZJ${date}${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { packageId, channel } = await req.json();
  if (!packageId || !channel) return fail("缺少参数");

  const pkg = PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return fail("无效套餐");

  const channelConfig = await prisma.paymentChannelConfig.findUnique({ where: { channelCode: channel } });
  if (!channelConfig || channelConfig.status !== "enabled") return fail(`支付渠道 ${channel} 不可用`);

  const outTradeNo = genOutTradeNo();

  const order = await prisma.paymentOrder.create({
    data: {
      userId: user.userId,
      channel,
      outTradeNo,
      amountCent: pkg.amountCent,
      credits: pkg.credits,
      status: "pending",
    },
  });

  // Mock 支付链接（生产：调用微信/支付宝接口）
  const payUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ZAOJING_PAY_${outTradeNo}`;

  return ok({ orderNo: outTradeNo, payUrl, amountCent: pkg.amountCent, credits: pkg.credits });
}
