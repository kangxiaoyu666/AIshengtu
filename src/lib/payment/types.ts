/** 支付渠道标识 */
export type PayChannel = "wechat" | "alipay" | "mock";

/** 渠道配置（数据库存储结构） */
export interface ChannelConfig {
  id: string;
  channelCode: string;
  channelName: string;
  appId: string;
  merchantId: string;
  gatewayUrl: string;
  notifyUrl: string;
  returnUrl: string;
  configJson: string; // JSON: { apiV3Key?, privateKey?, certSerialNo?, ... }
  status: "enabled" | "disabled";
  createdAt: Date;
  updatedAt: Date;
}

/** 创建订单参数 */
export interface CreateOrderParams {
  userId: string;
  packageId: string;
  channel: PayChannel;
  clientIp?: string;
}

/** 支付下单结果 */
export interface PayResult {
  success: boolean;
  channel: PayChannel;
  orderNo: string;
  qrCode?: string;
  payUrl?: string;
  prepayId?: string;
  mockMode: boolean;
  error?: string;
}

/** 支付回调原始数据 */
export interface CallbackData {
  outTradeNo: string;
  transactionId: string;
  amountCent: number;
  status: string; // SUCCESS | FAIL
  rawBody: string;
  rawHeaders: Record<string, string>;
  channel: PayChannel;
}

/** 套餐定义 */
export interface RechargePackage {
  id: string;
  credits: number;
  amountCent: number;
  label: string;
  popular?: boolean;
}

/** 支付适配器接口 */
export interface IPayAdapter {
  readonly channel: PayChannel;
  readonly isMock: boolean;

  /** 创建支付订单 */
  createOrder(config: ChannelConfig, order: {
    outTradeNo: string;
    description: string;
    amountCent: number;
    notifyUrl: string;
  }): Promise<PayResult>;

  /** 验证回调签名 */
  verifyCallback(config: ChannelConfig, data: CallbackData): Promise<boolean>;

  /** 验证生产环境是否可启用 */
  canEnable(config: ChannelConfig): boolean;
}
