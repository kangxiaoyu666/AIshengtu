/**
 * 支付宝支付适配器
 * 一期为测试模式，生产环境需要支付宝开放平台 SDK
 */

interface AlipayOrderParams {
  outTradeNo: string;
  subject: string;
  totalAmount: number;  // 元
  notifyUrl?: string;
}

interface AlipayOrderResult {
  success: boolean;
  codeUrl?: string;
  qrCode?: string;
  error?: string;
  testMode: boolean;
}

export async function createAlipayOrder(params: AlipayOrderParams): Promise<AlipayOrderResult> {
  const { outTradeNo, subject, totalAmount, notifyUrl } = params;

  // 测试模式：返回模拟二维码
  const testCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ALIPAY_TEST_${outTradeNo}`;

  return {
    success: true,
    codeUrl: testCodeUrl,
    qrCode: testCodeUrl,
    testMode: true,
  };
}

/**
 * 支付宝回调验签
 */
export function verifyAlipaySignature(params: Record<string, string>, publicKey: string): boolean {
  // TODO: 接入支付宝SDK验签
  return true;
}
