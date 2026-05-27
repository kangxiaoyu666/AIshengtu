'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { RefreshCw, Loader2, CreditCard, Settings, CheckCircle, XCircle, Edit3, Eye, EyeOff } from 'lucide-react';

interface ChannelData {
  id: string; channelCode: string; channelName: string;
  appId: string; merchantId: string; gatewayUrl: string;
  notifyUrl: string; returnUrl: string; configJson: string;
  status: string; createdAt: string; updatedAt: string;
}

const defaultLabels: Record<string, string> = { wechat: '微信支付', alipay: '支付宝' };

export default function PaymentChannelsPage() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // 编辑表单
  const [form, setForm] = useState({
    channelCode: '', channelName: '', appId: '', merchantId: '',
    gatewayUrl: '', notifyUrl: '', returnUrl: '',
    apiV3Key: '', privateKey: '', publicKey: '', certSerialNo: '',
    status: 'disabled' as 'enabled' | 'disabled',
  });

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/payment-channels');
      const d = await r.json();
      setChannels(d.channels || []);
    } catch { toast.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const startEdit = (ch: ChannelData) => {
    setEditing(ch.channelCode);
    let configParsed: any = {};
    try { if (ch.configJson && ch.configJson !== '[已配置]' && ch.configJson !== '[未配置]') configParsed = JSON.parse(ch.configJson); } catch {}
    setForm({
      channelCode: ch.channelCode,
      channelName: ch.channelName || defaultLabels[ch.channelCode] || '',
      appId: ch.appId, merchantId: ch.merchantId,
      gatewayUrl: ch.gatewayUrl, notifyUrl: ch.notifyUrl, returnUrl: ch.returnUrl || '',
      apiV3Key: configParsed.apiV3Key || '',
      privateKey: configParsed.privateKey || '',
      publicKey: configParsed.publicKey || '',
      certSerialNo: configParsed.certSerialNo || '',
      status: ch.status as 'enabled' | 'disabled',
    });
  };

  const saveChannel = async () => {
    if (!form.appId || !form.merchantId) {
      if (form.status === 'enabled') { toast.error('启用前请填写 App ID 和商户号'); return; }
    }
    setSaving(true);
    try {
      const configJson = { apiV3Key: form.apiV3Key, privateKey: form.privateKey, publicKey: form.publicKey, certSerialNo: form.certSerialNo };
      const r = await fetch('/api/admin/payment-channels', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, configJson }),
      });
      const d = await r.json();
      if (d.success) { toast.success('保存成功'); setEditing(''); fetchChannels(); }
      else { toast.error(d.error || '保存失败'); }
    } catch { toast.error('保存失败'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (code: string, newStatus: 'enabled' | 'disabled') => {
    try {
      const r = await fetch('/api/admin/payment-channels', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelCode: code, status: newStatus }),
      });
      const d = await r.json();
      if (d.success) { toast.success(newStatus === 'enabled' ? '已启用' : '已停用'); fetchChannels(); }
      else { toast.error(d.error || '操作失败'); }
    } catch { toast.error('操作失败'); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">支付渠道配置</h1>
            <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px] font-semibold">{channels.length} 个渠道</Badge>
          </div>
          <p className="text-sm text-slate-500">配置微信支付/支付宝 · 敏感字段自动加密存储</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchChannels} className="text-slate-500 rounded-xl">
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />刷新</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>
      ) : (
        <div className="space-y-4">
          {channels.map(ch => (
            <Card key={ch.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    ch.channelCode === 'wechat' ? 'bg-emerald-50' : 'bg-blue-50'
                  }`}>
                    <CreditCard className={`h-4 w-4 ${ch.channelCode === 'wechat' ? 'text-emerald-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{ch.channelName || defaultLabels[ch.channelCode]}</p>
                    <p className="text-[10px] text-slate-400 font-mono">code: {ch.channelCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-[10px] border-0 font-medium ${
                    ch.status === 'enabled' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {ch.status === 'enabled' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    {ch.status === 'enabled' ? '已启用' : '已停用'}
                  </Badge>
                  {editing !== ch.channelCode ? (
                    <Button variant="ghost" size="sm" onClick={() => startEdit(ch)}
                      className="rounded-xl text-xs text-slate-400 hover:text-blue-500">
                      <Edit3 className="h-3.5 w-3.5 mr-1" />编辑</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setEditing('')}
                      className="rounded-xl text-xs text-slate-400">取消</Button>
                  )}
                </div>
              </div>

              {/* Edit Form */}
              {editing === ch.channelCode && (
                <div className="p-6 space-y-4 border-b border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-xs text-slate-500">渠道名称</Label>
                      <Input value={form.channelName} onChange={e => setForm({...form, channelName: e.target.value})}
                        className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
                    <div><Label className="text-xs text-slate-500">
                      {ch.channelCode === 'wechat' ? 'App ID (应用ID)' : 'App ID'}</Label>
                      <Input value={form.appId} onChange={e => setForm({...form, appId: e.target.value})}
                        placeholder={ch.channelCode === 'wechat' ? 'wx...' : '2021...'}
                        className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-sm" /></div>
                    <div><Label className="text-xs text-slate-500">
                      {ch.channelCode === 'wechat' ? '商户号 (MCH ID)' : '商户号 (PID)'}</Label>
                      <Input value={form.merchantId} onChange={e => setForm({...form, merchantId: e.target.value})}
                        placeholder="16xxxxx"
                        className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-sm" /></div>
                    <div><Label className="text-xs text-slate-500">网关地址</Label>
                      <Input value={form.gatewayUrl} onChange={e => setForm({...form, gatewayUrl: e.target.value})}
                        className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                    <div><Label className="text-xs text-slate-500">回调地址 (notify_url)</Label>
                      <Input value={form.notifyUrl} onChange={e => setForm({...form, notifyUrl: e.target.value})}
                        placeholder="https://你的域名/api/pay/callback"
                        className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                    <div><Label className="text-xs text-slate-500">返回地址 (return_url)</Label>
                      <Input value={form.returnUrl} onChange={e => setForm({...form, returnUrl: e.target.value})}
                        className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                  </div>

                  {/* Secrets */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-500 font-semibold">密钥配置（加密存储）</Label>
                        <button onClick={() => setShowSecrets({...showSecrets, [ch.channelCode]: !showSecrets[ch.channelCode]})}
                          className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-1">
                          {showSecrets[ch.channelCode] ? <><EyeOff className="h-3 w-3"/>隐藏</> : <><Eye className="h-3 w-3"/>显示</>}</button>
                      </div>
                      <span className="text-[10px] text-amber-500">密钥不明文回显，仅展示是否已配置</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><Label className="text-xs text-slate-400">API密钥</Label>
                        <Input type={showSecrets[ch.channelCode] ? 'text' : 'password'}
                          value={form.apiV3Key} onChange={e => setForm({...form, apiV3Key: e.target.value})}
                          placeholder="32位密钥" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                      <div><Label className="text-xs text-slate-400">证书序列号</Label>
                        <Input value={form.certSerialNo} onChange={e => setForm({...form, certSerialNo: e.target.value})}
                          placeholder="序列号" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                      <div><Label className="text-xs text-slate-400">
                        {ch.channelCode === 'wechat' ? '商户私钥 (PEM)' : '应用私钥'}</Label>
                        <Input type={showSecrets[ch.channelCode] ? 'text' : 'password'}
                          value={form.privateKey} onChange={e => setForm({...form, privateKey: e.target.value})}
                          placeholder="-----BEGIN PRIVATE KEY-----"
                          className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                      <div><Label className="text-xs text-slate-400">
                        {ch.channelCode === 'wechat' ? '平台公钥' : '支付宝公钥'}</Label>
                        <Input type={showSecrets[ch.channelCode] ? 'text' : 'password'}
                          value={form.publicKey} onChange={e => setForm({...form, publicKey: e.target.value})}
                          placeholder="-----BEGIN PUBLIC KEY-----"
                          className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
                    </div>
                  </div>

                  {/* Status + Save */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <Label className="text-xs text-slate-500">启用状态</Label>
                      <Switch checked={form.status === 'enabled'}
                        onCheckedChange={v => setForm({...form, status: v ? 'enabled' : 'disabled'})} />
                      <span className="text-[10px] text-slate-400">
                        {form.status === 'enabled' ? '前台展示该支付方式' : '前台不展示该支付方式'}
                      </span>
                    </div>
                    <Button onClick={saveChannel} disabled={saving}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                      {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}保存配置</Button>
                  </div>
                </div>
              )}

              {/* Summary when not editing */}
              {editing !== ch.channelCode && (
                <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-slate-400">App ID：</span>
                    <span className="text-slate-600 font-mono">{ch.appId || '未配置'}</span></div>
                  <div><span className="text-slate-400">商户号：</span>
                    <span className="text-slate-600 font-mono">{ch.merchantId || '未配置'}</span></div>
                  <div><span className="text-slate-400">密钥状态：</span>
                    <span className={ch.configJson === '[已配置]' ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                      {ch.configJson === '[已配置]' ? '已配置' : '未配置'}</span></div>
                  <div><span className="text-slate-400">最后更新：</span>
                    <span className="text-slate-500">{new Date(ch.updatedAt).toLocaleDateString('zh-CN')}</span></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
