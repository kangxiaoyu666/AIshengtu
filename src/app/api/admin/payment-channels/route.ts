import { NextRequest, NextResponse } from 'next/server';
import { getAllPaymentChannels, savePaymentChannel, updatePaymentChannelStatus, getPaymentChannelByCode } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

// GET - 获取所有支付渠道（敏感字段脱敏）
export async function GET(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const channels = getAllPaymentChannels().map(c => ({
      ...c,
      configJson: c.configJson && c.configJson !== '{}' ? '[已配置]' : '[未配置]',
    }));
    return NextResponse.json({ channels, total: channels.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - 保存支付渠道配置
export async function PUT(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const body = await req.json();
    const { channelCode, channelName, appId, merchantId, gatewayUrl, notifyUrl, returnUrl, configJson, status } = body;
    
    if (!channelCode) {
      return NextResponse.json({ error: '缺少channelCode' }, { status: 400 });
    }
    
    // 验证：如果启用，必须填写必要字段
    if (status === 'enabled') {
      if (!appId || !merchantId) {
        return NextResponse.json({ error: '启用前请填写 App ID 和商户号' }, { status: 400 });
      }
    }
    
    const channel = savePaymentChannel({
      channelCode, channelName, appId: appId || '', merchantId: merchantId || '',
      gatewayUrl: gatewayUrl || '', notifyUrl: notifyUrl || '', returnUrl: returnUrl || '',
      configJson: typeof configJson === 'object' ? JSON.stringify(configJson) : (configJson || '{}'),
      status: status || 'disabled',
    });
    
    return NextResponse.json({ success: true, channel: { ...channel, configJson: channel.configJson !== '{}' ? '[已配置]' : '[未配置]' } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH - 切换状态
export async function PATCH(req: NextRequest) {
  const authErr = requireAdmin(req); if (authErr) return authErr;
  try {
    const body = await req.json();
    const { channelCode, status } = body;
    
    if (!channelCode) {
      return NextResponse.json({ error: '缺少channelCode' }, { status: 400 });
    }
    
    // 启用前验证
    if (status === 'enabled') {
      const ch = getPaymentChannelByCode(channelCode);
      if (!ch || !ch.appId || !ch.merchantId) {
        return NextResponse.json({ error: '请先完善支付配置后再启用' }, { status: 400 });
      }
    }
    
    const ok = updatePaymentChannelStatus(channelCode, status);
    if (!ok) return NextResponse.json({ error: '渠道不存在' }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
