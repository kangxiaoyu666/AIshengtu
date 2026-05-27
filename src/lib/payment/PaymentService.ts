/**
 * PaymentService — 统一支付服务
 *
 * 职责：
 * - 管理支付渠道注册表
 * - 根据渠道自动选择适配器
 * - 校验套餐金额（不相信前端传值）
 * - 创建订单 → 调用适配器 → 返回支付凭证
 * - 处理回调 → 幂等 → 加点数
 */
import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/services/credit";
import { MockPayAdapter } from "./adapters/mock";
import { WechatPayAdapter } from "./adapters/wechat";
import { AlipayAdapter } from "./adapters/alipay";
import type { IPayAdapter, PayChannel, PayResult, CallbackData, ChannelConfig, RechargePackage } from "./types";
import crypto from "crypto";

// ==================== 套餐配置（服务端唯一真相源） ====================
export const RECHARGE_PACKAGES: RechargePackage[] = [
  { id: "pkg1", credits: 100, amountCent: 990, label: "100点" },
  { id: "pkg2", credits: 500, amountCent: 3990, label: "500点", popular: true },
  { id: "pkg3", credits: 1200, amountCent: 7990, label: "1200点" },
  { id: "pkg4", credits: 3000, amountCent: 16990, label: "3000点" },
  { id: "pkg5", credits: 8000, amountCent: 39990, label: "8000点" },
];

function genOutTradeNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ZJ${date}${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

export class PaymentService {
  private static adapters: Map<string, IPayAdapter> = new Map();

  /** 注册适配器 */
  static register(adapter: IPayAdapter) {
    this.adapters.set(adapter.channel, adapter);
  }

  /** 获取适配器 */
  static getAdapter(channel: PayChannel): IPayAdapter {
    const adapter = this.adapters.get(channel);
    if (!adapter) throw new Error(`未找到支付渠道: ${channel}`);
    return adapter;
  }

  /** 获取套餐列表 */
  static getPackages(): RechargePackage[] {
    return RECHARGE_PACKAGES;
  }

  /** 校验套餐 */
  static getPackage(packageId: string): RechargePackage {
    const pkg = RECHARGE_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) throw new Error(`无效套餐: ${packageId}`);
    return pkg;
  }

  /** 获取渠道配置（脱敏：不返回密钥） */
  static async getChannelConfig(channel: PayChannel): Promise<ChannelConfig> {
    const config = await prisma.paymentChannelConfig.findUnique({ where: { channelCode: channel } });
    if (!config) throw new Error(`渠道不存在: ${channel}`);

    // 脱敏：不返回密钥内容
    let configJson = "{}";
    try {
      const c = JSON.parse(config.configJson);
      configJson = JSON.stringify({
        apiV3Key: c.apiV3Key ? "****" : "",
        privateKey: c.privateKey ? "****" : "",
        certSerialNo: c.certSerialNo || "",
        alipayPublicKey: c.alipayPublicKey ? "****" : "",
      });
    } catch {}

    return {
      ...config,
      configJson,
    } as unknown as ChannelConfig;
  }

  /** 获取完整渠道配置（内部使用，含密钥） */
  private static async getChannelConfigFull(channel: PayChannel) {
    return prisma.paymentChannelConfig.findUnique({ where: { channelCode: channel } });
  }

  /** 创建充值订单 + 发起支付 */
  static async createOrder(params: {
    userId: string;
    packageId: string;
    channel: PayChannel;
  }): Promise<PayResult> {
    const { userId, packageId, channel } = params;

    // 1. 校验套餐
    const pkg = this.getPackage(packageId);

    // 2. 获取渠道配置
    const channelConfig = await this.getChannelConfigFull(channel);
    if (!channelConfig || channelConfig.status !== "enabled") {
      throw new Error(`支付渠道 ${channel} 未启用`);
    }

    // 3. 获取适配器
    const adapter = this.getAdapter(channel);

    // Mock 模式跳过配置校验
    if (!adapter.isMock && !adapter.canEnable(channelConfig as any)) {
      throw new Error(`支付渠道 ${channel} 配置不完整，无法启用`);
    }

    // 4. 创建订单
    const outTradeNo = genOutTradeNo();
    const order = await prisma.paymentOrder.create({
      data: {
        userId,
        channel,
        outTradeNo,
        amountCent: pkg.amountCent,
        credits: pkg.credits,
        status: "pending",
      },
    });

    // 5. 调用适配器发起支付
    const result = await adapter.createOrder(channelConfig as any, {
      outTradeNo,
      description: `造境AI-${pkg.credits}点充值`,
      amountCent: pkg.amountCent,
      notifyUrl: channelConfig.notifyUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/pay/${channel}/notify`,
    });

    return result;
  }

  /** Mock 支付成功（开发环境） */
  static async mockPaySuccess(userId: string, outTradeNo: string) {
    const adapter = this.getAdapter("mock");
    if (!adapter.isMock) throw new Error("非 mock 模式");

    return this.handleCallback({
      outTradeNo,
      transactionId: `MOCK_TXN_${Date.now()}`,
      amountCent: 0,
      status: "SUCCESS",
      rawBody: "",
      rawHeaders: {},
      channel: "mock",
    });
  }

  /** 统一回调处理（幂等 + 加点数） */
  static async handleCallback(data: CallbackData) {
    const { outTradeNo, transactionId, channel } = data;

    // 1. 查订单
    const order = await prisma.paymentOrder.findUnique({ where: { outTradeNo } });
    if (!order) {
      console.error(`[Payment] 订单不存在: ${outTradeNo}`);
      return { code: "FAIL", message: "订单不存在" };
    }

    // 2. 幂等：已支付直接返回成功
    if (order.status === "paid") {
      return { code: "SUCCESS", message: "已处理" };
    }

    // 3. 幂等：同一 transactionId 已处理
    if (transactionId && transactionId !== "MOCK_TXN_0") {
      const dup = await prisma.paymentOrder.findFirst({
        where: { transactionId, status: "paid", id: { not: order.id } },
      });
      if (dup) {
        console.error(`[Payment] transactionId 重复: ${transactionId}`);
        return { code: "FAIL", message: "重复交易" };
      }
    }

    // 4. Mock 渠道：跳过验签
    if (channel !== "mock") {
      const channelConfig = await this.getChannelConfigFull(channel as PayChannel);
      const adapter = this.getAdapter(channel as PayChannel);
      const valid = await adapter.verifyCallback(channelConfig as any, data);
      if (!valid) {
        console.error(`[Payment] 验签失败: ${outTradeNo}`);
        return { code: "FAIL", message: "验签失败" };
      }
    }

    // 5. 事务：改订单 + 加点数
    try {
      await prisma.$transaction(async (tx) => {
        await tx.paymentOrder.update({
          where: { id: order.id },
          data: { status: "paid", transactionId, paidAt: new Date() },
        });

        await CreditService.recharge(order.userId, order.credits, order.id);
      });

      console.log(`[Payment] 充值成功: user=${order.userId}, credits=${order.credits}, txn=${transactionId}`);
      return { code: "SUCCESS", message: "充值成功" };
    } catch (e: any) {
      console.error(`[Payment] 处理失败: ${e.message}`);
      return { code: "FAIL", message: e.message };
    }
  }

  /** 查询用户订单 */
  static async getUserOrders(userId: string, limit = 20) {
    return prisma.paymentOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /** 后台：获取所有订单 */
  static async getAllOrders(limit = 100) {
    return prisma.paymentOrder.findMany({
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

// ==================== 启动时注册适配器 ====================
PaymentService.register(new MockPayAdapter());
PaymentService.register(new WechatPayAdapter());
PaymentService.register(new AlipayAdapter());
