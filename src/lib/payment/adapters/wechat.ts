import type { IPayAdapter, PayResult, CallbackData, ChannelConfig } from "../types";
import crypto from "crypto";

export class WechatPayAdapter implements IPayAdapter {
  readonly channel = "wechat" as const;
  readonly isMock = false;

  canEnable(config: ChannelConfig): boolean {
    if (!config.appId || !config.merchantId) return false;
    try {
      const c = JSON.parse(config.configJson || "{}");
      return !!(c.apiV3Key && c.privateKey && c.certSerialNo);
    } catch {
      return false;
    }
  }

  private parseConfig(config: ChannelConfig) {
    let c: Record<string, string> = {};
    try { c = JSON.parse(config.configJson || "{}"); } catch {}
    return {
      appId: config.appId,
      mchid: config.merchantId,
      apiV3Key: c.apiV3Key || "",
      privateKey: c.privateKey || "",
      serialNo: c.certSerialNo || "",
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
      return { success: false, channel: "wechat", orderNo: order.outTradeNo, mockMode: false, error: "微信支付未完整配置" };
    }

    const method = "POST";
    const url = "/v3/pay/transactions/native";
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = crypto.randomBytes(16).toString("hex");

    const body = JSON.stringify({
      appid: cfg.appId,
      mchid: cfg.mchid,
      description: order.description,
      out_trade_no: order.outTradeNo,
      notify_url: notifyUrl,
      amount: { total: order.amountCent, currency: "CNY" },
    });

    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
    try {
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(message);
      const signature = sign.sign(cfg.privateKey, "base64");
      const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${cfg.mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${cfg.serialNo}"`;

      const resp = await fetch(`https://api.mch.weixin.qq.com${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authorization },
        body,
      });

      const data = await resp.json();
      if (resp.ok && data.code_url) {
        return { success: true, channel: "wechat", orderNo: order.outTradeNo, qrCode: data.code_url, mockMode: false };
      }
      return { success: false, channel: "wechat", orderNo: order.outTradeNo, mockMode: false, error: data.message || "创建支付失败" };
    } catch (e: any) {
      return { success: false, channel: "wechat", orderNo: order.outTradeNo, mockMode: false, error: e.message };
    }
  }

  async verifyCallback(config: ChannelConfig, data: CallbackData): Promise<boolean> {
    const cfg = this.parseConfig(config);
    try {
      const verify = crypto.createVerify("RSA-SHA256");
      // WeChat callback signature verification
      const timestamp = data.rawHeaders["wechatpay-timestamp"] || "";
      const nonce = data.rawHeaders["wechatpay-nonce"] || "";
      const signature = data.rawHeaders["wechatpay-signature"] || "";
      const message = `${timestamp}\n${nonce}\n${data.rawBody}\n`;
      verify.update(message);
      return verify.verify(cfg.privateKey, signature, "base64");
    } catch {
      return false;
    }
  }
}
