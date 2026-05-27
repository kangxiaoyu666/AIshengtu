'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Globe, HardDrive, Shield, Database, CreditCard, Key, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: '造境 AI', siteDesc: '中文AI修图神器',
    maxUploadSize: '10', maxImagesPerReq: '5',
    enableRegistration: true, enableGuestUpload: true, enableWatermark: false, enableCdn: true,
  });
  const [testMode, setTestMode] = useState(true);
  const [wx, setWx] = useState({ mchId: '', appId: '', apiV3Key: '', serialNo: '', privateKey: '' });

  const saveSettings = () => {
    localStorage.setItem('jiaotu_admin_settings', JSON.stringify(settings));
    toast.success('设置已保存');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">系统设置</h1><p className="text-sm text-slate-500 mt-0.5">全局系统配置管理</p></div>
        <Button onClick={saveSettings} size="sm" className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md shadow-blue-500/20">
          <Save className="h-3.5 w-3.5 mr-1.5" />保存设置</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-slate-100 border border-slate-200 rounded-2xl p-1 mb-6 w-fit">
          <TabsTrigger value="general" className="rounded-xl text-xs">基本设置</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-xl text-xs">支付配置</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><Globe className="h-4 w-4 text-blue-500" /><h3 className="text-sm font-semibold text-slate-800">基本设置</h3></div>
              <div className="space-y-3">
                <div><Label className="text-xs text-slate-500">站点名称</Label><Input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
                <div><Label className="text-xs text-slate-500">站点描述</Label><Input value={settings.siteDesc} onChange={(e) => setSettings({...settings, siteDesc: e.target.value})} className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
              </div>
            </Card>
            <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><HardDrive className="h-4 w-4 text-blue-500" /><h3 className="text-sm font-semibold text-slate-800">上传限制</h3></div>
              <div className="space-y-3">
                <div><Label className="text-xs text-slate-500">最大上传 (MB)</Label><Input value={settings.maxUploadSize} onChange={(e) => setSettings({...settings, maxUploadSize: e.target.value})} className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
                <div><Label className="text-xs text-slate-500">单次最大图片数</Label><Input value={settings.maxImagesPerReq} onChange={(e) => setSettings({...settings, maxImagesPerReq: e.target.value})} className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
              </div>
            </Card>
            <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><Shield className="h-4 w-4 text-emerald-500" /><h3 className="text-sm font-semibold text-slate-800">功能开关</h3></div>
              <div className="space-y-3">
                {[
                  {key:'enableRegistration',label:'开放注册',desc:'允许新用户注册'},
                  {key:'enableGuestUpload',label:'游客上传',desc:'未登录用户可上传图片'},
                  {key:'enableWatermark',label:'水印',desc:'生成图片添加水印'},
                  {key:'enableCdn',label:'CDN加速',desc:'使用CDN分发静态资源'},
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div><p className="text-sm text-slate-700">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                    <Switch checked={(settings as any)[item.key]} onCheckedChange={(v) => setSettings({...settings, [item.key]: v})} />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><Database className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold text-slate-800">维护</h3></div>
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => { localStorage.clear(); toast.success('缓存已清除'); }}
                  className="w-full rounded-xl border-slate-200 text-slate-600">清除系统缓存</Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-800">微信支付配置</h3>
            </div>
            <div className="mb-5 flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div>
                <p className="text-sm text-slate-700 font-medium">测试模式</p>
                <p className="text-xs text-slate-500">开启后使用模拟支付，关闭后接入真实微信支付</p>
              </div>
              <Switch checked={testMode} onCheckedChange={setTestMode} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-xs text-slate-500">商户号 (MCH ID)</Label>
                <Input value={wx.mchId} onChange={(e) => setWx({...wx, mchId: e.target.value})}
                  placeholder="16xxxxx" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-sm" /></div>
              <div><Label className="text-xs text-slate-500">App ID</Label>
                <Input value={wx.appId} onChange={(e) => setWx({...wx, appId: e.target.value})}
                  placeholder="wx..." className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-sm" /></div>
              <div><Label className="text-xs text-slate-500">API v3 密钥</Label>
                <Input value={wx.apiV3Key} onChange={(e) => setWx({...wx, apiV3Key: e.target.value})}
                  placeholder="32位密钥" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-sm" /></div>
              <div><Label className="text-xs text-slate-500">证书序列号</Label>
                <Input value={wx.serialNo} onChange={(e) => setWx({...wx, serialNo: e.target.value})}
                  placeholder="序列号" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-sm" /></div>
            </div>
            <div className="mt-4">
              <Label className="text-xs text-slate-500">商户私钥 (PEM)</Label>
              <Input value={wx.privateKey} onChange={(e) => setWx({...wx, privateKey: e.target.value})}
                placeholder="-----BEGIN PRIVATE KEY-----" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" />
            </div>
            <Button onClick={() => toast.success('微信支付配置已保存')} size="sm"
              className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20">
              <Save className="h-3.5 w-3.5 mr-1.5" />保存支付配置</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
