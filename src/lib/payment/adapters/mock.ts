import type { IPayAdapter, PayResult, CallbackData, ChannelConfig } from "../types";
import crypto from "crypto";

export class MockPayAdapter implements IPayAdapter {
  readonly channel = "mock" as const;
  readonly isMock = true;

  async createOrder(
    _config: ChannelConfig,
    order: { outTradeNo: string; description: string; amountCent: number; notifyUrl: string }
  ): Promise<PayResult> {
    // 生成模拟二维码（指向本系统回调）
    const mockCode = `MOCK_PAY_${order.outTradeNo}_${Date.now()}`;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${mockCode}`;

    return {
      success: true,
      channel: "mock",
      orderNo: order.outTradeNo,
      qrCode,
      payUrl: mockCode,
      mockMode: true,
    };
  }

  async verifyCallback(_config: ChannelConfig, data: CallbackData): Promise<boolean> {
    return data.status === "SUCCESS";
  }

  canEnable(_config: ChannelConfig): boolean {
    return true;
  }
}
