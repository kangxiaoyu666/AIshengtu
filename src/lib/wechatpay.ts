import crypto from 'crypto';

export interface WxPayConfig {
  mchid: string;
  appId: string;
  apiV3Key: string;
  serialNo: string;
  privateKey: string;
  notifyUrl: string;
  testMode: boolean;
}

export interface WxPayOrder {
  outTradeNo: string;
  description: string;
  amount: { total: number; currency?: string };
  payer?: { openid: string };
}

function getConfig(): WxPayConfig {
  return {
    mchid: process.env.WECHAT_MERCHANT_ID || '',
    appId: process.env.WECHAT_APP_ID || '',
    apiV3Key: process.env.WECHAT_API_V3_KEY || '',
    serialNo: process.env.WECHAT_SERIAL_NO || '',
    privateKey: process.env.WECHAT_PRIVATE_KEY || '',
    notifyUrl: process.env.WECHAT_NOTIFY_URL || 'http://localhost:3000/api/pay/wechat/notify',
    testMode: !process.env.WECHAT_MERCHANT_ID,
  };
}

export async function createNativeOrder(
  order: WxPayOrder,
  options?: { channelConfig?: { appId?: string; merchantId?: string; notifyUrl?: string; configJson?: string } }
): Promise<{ success: boolean; codeUrl?: string; outTradeNo?: string; prepayId?: string; error?: string; testMode?: boolean }> {
  const config = getConfig();

  if (options?.channelConfig) {
    const cc = options.channelConfig;
    let configParsed: any = {};
    try { if (cc.configJson && cc.configJson !== '{}') configParsed = JSON.parse(cc.configJson); } catch {}
    if (cc.appId) config.appId = cc.appId;
    if (cc.merchantId) config.mchid = cc.merchantId;
    if (cc.notifyUrl) config.notifyUrl = cc.notifyUrl;
    if (configParsed.apiV3Key) config.apiV3Key = configParsed.apiV3Key;
    if (configParsed.privateKey) config.privateKey = configParsed.privateKey;
    if (configParsed.certSerialNo) config.serialNo = configParsed.certSerialNo;
    if (configParsed.apiV3Key && configParsed.privateKey) config.testMode = false;
  }

  if (config.testMode) {
    return { success: true, codeUrl: `weixin://wxpay/bizpayurl?pr=test_${order.outTradeNo}`, outTradeNo: order.outTradeNo, testMode: true };
  }

  const method = 'POST';
  const url = '/v3/pay/transactions/native';
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const body = JSON.stringify({
    appid: config.appId, mchid: config.mchid, description: order.description,
    out_trade_no: order.outTradeNo, notify_url: config.notifyUrl,
    amount: { total: order.amount.total, currency: order.amount.currency || 'CNY' },
  });

  const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  const signature = sign.sign(config.privateKey, 'base64');
  const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${config.serialNo}"`;

  try {
    const resp = await fetch(`https://api.mch.weixin.qq.com${url}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: authorization }, body,
    });
    const data = await resp.json();
    if (resp.ok && data.code_url) return { success: true, codeUrl: data.code_url, outTradeNo: order.outTradeNo };
    return { success: false, error: data.message || '创建支付失败', outTradeNo: order.outTradeNo };
  } catch (e: any) {
    return { success: false, error: e.message, outTradeNo: order.outTradeNo };
  }
}

export function verifyCallbackSignature(timestamp: string, nonce: string, body: string, signature: string): boolean {
  const config = getConfig();
  if (config.testMode) return true;
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(message);
  return verify.verify(config.privateKey, signature, 'base64');
}

export function decryptCallbackData(associatedData: string, nonce: string, ciphertext: string): string {
  const config = getConfig();
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(config.apiV3Key), Buffer.from(nonce));
  decipher.setAAD(Buffer.from(associatedData));
  decipher.setAuthTag(Buffer.from(ciphertext.slice(-32), 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext.slice(0, -32), 'hex')), decipher.final()]).toString('utf8');
}

export function generateOutTradeNo(prefix = 'JIAOTU'): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `${prefix}${date}${random}`;
}
