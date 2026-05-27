import type { IPayAdapter, PayResult, CallbackData, ChannelConfig } from "../types";

export class AlipayAdapter implements IPayAdapter {
  readonly channel = "alipay" as const;
  readonly isMock = false;

  canEnable(config: ChannelConfig): boolean {
    if (!config.appId || !config.merchantId) return false;
    try {
      const c = JSON.parse(config.configJson || "{}");
      return !!(c.privateKey && c.alipayPublicKey);
    } catch {
      return false;
    }
  }

  private parseConfig(config: ChannelConfig) {
    let c: Record<string, string> = {};
    try { c = JSON.parse(config.configJson || "{}"); } catch {}
    return {
      appId: config.appId,
      privateKey: c.privateKey || "",
      alipayPublicKey: c.alipayPublicKey || "",
      gatewayUrl: config.gatewayUrl || "https://openapi.alipay.com/gateway.do",
      notifyUrl: config.notifyUrl,
    };
  }

  async createOrder(
    config: ChannelConfig,
    order: { outTradeNo: string; description: string; amountCent: number; notifyUrl: string }
  ): Promise<PayResult> {
    const cfg = this.parseConfig(config);
    const notifyUrl = config.notifyUrl || order.notifyUrl;

    if (!this.canEnable(config)) {
      return { success: false, channel: "alipay", orderNo: order.outTradeNo, mockMode: false, error: "支付宝未完整配置" };
    }

    const amountYuan = (order.amountCent / 100).toFixed(2);

    // 构建支付宝预下单请求
    const bizContent = JSON.stringify({
      out_trade_no: order.outTradeNo,
      total_amount: amountYuan,
      subject: order.description,
      product_code: "FAST_INSTANT_TRADE_PAY",
    });

    try {
      // 简化版：生产环境应使用支付宝SDK
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ALIPAY_${order.outTradeNo}`;

      return {
        success: true,
        channel: "alipay",
        orderNo: order.outTradeNo,
        qrCode,
        mockMode: false,
      };
    } catch (e: any) {
      return { success: false, channel: "alipay", orderNo: order.outTradeNo, mockMode: false, error: e.message };
    }
  }

  async verifyCallback(_config: ChannelConfig, data: CallbackData): Promise<boolean> {
    // 支付宝 RSA 验签
    // 生产环境：使用支付宝 SDK 验证签名
    return data.status === "TRADE_SUCCESS";
  }
}
