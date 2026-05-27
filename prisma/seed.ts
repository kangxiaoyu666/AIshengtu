import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "zaojing-salt").digest("hex");
}

async function main() {
  // 创建管理员
  const admin = await prisma.user.upsert({
    where: { email: "admin@zaojing.ai" },
    update: {},
    create: {
      email: "admin@zaojing.ai",
      name: "管理员",
      password: hashPassword("admin123"),
      role: "admin",
    },
  });
  console.log("Admin:", admin.email);

  // 创建点数账户
  await prisma.creditAccount.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 9999 },
  });

  // 初始支付渠道
  await prisma.paymentChannelConfig.upsert({
    where: { channelCode: "wechat" },
    update: {},
    create: {
      id: "pc-wechat", channelCode: "wechat", channelName: "微信支付",
      status: "disabled",
    },
  });
  await prisma.paymentChannelConfig.upsert({
    where: { channelCode: "alipay" },
    update: {},
    create: {
      id: "pc-alipay", channelCode: "alipay", channelName: "支付宝",
      status: "disabled",
    },
  });

  // 初始 AI 模型
  await prisma.aiModel.upsert({
    where: { id: "model-default" },
    update: {},
    create: {
      id: "model-default", name: "默认模型", provider: "openai",
      modelName: "dall-e-3", endpoint: "https://api.openai.com/v1",
      apiKeyEnv: "OPENAI_API_KEY", pointsPerUse: 2, priority: 1,
    },
  });
  await prisma.aiModel.upsert({
    where: { id: "model-stability" },
    update: {},
    create: {
      id: "model-stability", name: "写实模型", provider: "stability",
      modelName: "stable-diffusion-xl", endpoint: "https://api.stability.ai",
      apiKeyEnv: "STABILITY_API_KEY", pointsPerUse: 3, priority: 2,
    },
  });

  console.log("Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
