'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, RotateCcw, RefreshCw, Loader2, Globe, Home, Image, Zap, Layers, Settings, Plus, Trash2, Check, X } from 'lucide-react';

interface CMSConfig { site:any; hero:any; tools:any[]; quickPrompts:string[]; stats:any[]; rechargePackages:any[]; studioTools:any[]; }

export default function CMSPage() {
  const [config, setConfig] = useState<CMSConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try { const r = await window.fetch('/api/cms/config'); setConfig(await r.json()); }
    catch { toast.error('加载配置失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await window.fetch('/api/cms/config', { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(config) });
      toast.success('配置已保存，前台即时生效');
    } catch { toast.error('保存失败'); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (!confirm('确定恢复默认配置？')) return;
    await window.fetch('/api/cms/config', { method: 'DELETE' });
    toast.success('已恢复默认');
    fetchConfig();
  };

  const updateSite = (key: string, value: string) => { if (!config) return; setConfig({ ...config, site: { ...config.site, [key]: value } }); };
  const updateHero = (key: string, value: string) => { if (!config) return; setConfig({ ...config, hero: { ...config.hero, [key]: value } }); };
  const updateTool = (idx: number, key: string, value: any) => {
    if (!config) return;
    const tools = [...config.tools]; tools[idx] = { ...tools[idx], [key]: value };
    setConfig({ ...config, tools });
  };
  const updatePrompt = (idx: number, value: string) => {
    if (!config) return;
    const prompts = [...config.quickPrompts]; prompts[idx] = value;
    setConfig({ ...config, quickPrompts: prompts });
  };
  const addPrompt = () => {
    if (!config) return;
    setConfig({ ...config, quickPrompts: [...config.quickPrompts, '新提示词'] });
  };
  const removePrompt = (idx: number) => {
    if (!config) return;
    setConfig({ ...config, quickPrompts: config.quickPrompts.filter((_, i) => i !== idx) });
  };
  const updatePkg = (idx: number, key: string, value: any) => {
    if (!config) return;
    const pkgs = [...config.rechargePackages]; pkgs[idx] = { ...pkgs[idx], [key]: value };
    setConfig({ ...config, rechargePackages: pkgs });
  };

  if (loading || !config) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-400"/></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">CMS 内容管理</h1><p className="text-sm text-slate-500 mt-0.5">后台配置，前台即时生效</p></div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500 rounded-xl"><RotateCcw className="h-4 w-4 mr-1.5"/>重置</Button>
          <Button size="sm" onClick={save} disabled={saving} className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white border-0">
            <Save className="h-4 w-4 mr-1.5"/>{saving?'保存中...':'保存配置'}</Button>
        </div>
      </div>

      <Tabs defaultValue="site">
        <TabsList className="bg-white border border-slate-200 rounded-2xl p-1 mb-6 w-fit">
          {[
            {v:'site',label:'站点信息',icon:Globe},
            {v:'hero',label:'首页Hero',icon:Home},
            {v:'tools',label:'工具卡片',icon:Zap},
            {v:'prompts',label:'提示词',icon:Layers},
            {v:'pricing',label:'充值套餐',icon:Settings},
          ].map(t => (
            <TabsTrigger key={t.v} value={t.v} className="rounded-xl text-xs px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-slate-500">
              <t.icon className="h-3.5 w-3.5 mr-1.5"/>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="site">
          <Card className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500"/>站点信息</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-500">站点名称</label><Input value={config.site.name} onChange={e=>updateSite('name',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
              <div><label className="text-xs text-slate-500">标语</label><Input value={config.site.slogan} onChange={e=>updateSite('slogan',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
              <div className="md:col-span-2"><label className="text-xs text-slate-500">站点描述</label><Textarea value={config.site.description} onChange={e=>updateSite('description',e.target.value)} className="rounded-xl bg-white border-slate-200 text-sm" rows={2}/></div>
              <div className="md:col-span-2"><label className="text-xs text-slate-500">关键词（逗号分隔）</label><Input value={config.site.keywords} onChange={e=>updateSite('keywords',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
              <div><label className="text-xs text-slate-500">Footer 文本</label><Input value={config.site.footer} onChange={e=>updateSite('footer',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Home className="h-4 w-4 text-blue-500"/>首页 Hero</h3>
            <div className="grid gap-3">
              <div><label className="text-xs text-slate-500">徽标文字</label><Input value={config.hero.badge} onChange={e=>updateHero('badge',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
              <div><label className="text-xs text-slate-500">主标题</label><Input value={config.hero.heading} onChange={e=>updateHero('heading',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
              <div><label className="text-xs text-slate-500">副标题</label><Input value={config.hero.subheading} onChange={e=>updateHero('subheading',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
              <div><label className="text-xs text-slate-500">描述文字</label><Textarea value={config.hero.desc} onChange={e=>updateHero('desc',e.target.value)} className="rounded-xl bg-white border-slate-200 text-sm" rows={2}/></div>
              <div><label className="text-xs text-slate-500">输入框占位符</label><Input value={config.hero.inputPlaceholder} onChange={e=>updateHero('inputPlaceholder',e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm"/></div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500"/>工具卡片（首页展示）</h3>
            {config.tools.map((tool:any, idx:number) => (
              <div key={tool.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{idx+1}</div>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <Input value={tool.title} onChange={e=>updateTool(idx,'title',e.target.value)} className="h-8 rounded-lg bg-white border-slate-200 text-xs" placeholder="标题"/>
                  <Input value={tool.desc} onChange={e=>updateTool(idx,'desc',e.target.value)} className="h-8 rounded-lg bg-white border-slate-200 text-xs" placeholder="描述"/>
                  <Input value={tool.prompt} onChange={e=>updateTool(idx,'prompt',e.target.value)} className="h-8 rounded-lg bg-white border-slate-200 text-xs" placeholder="跳转提示词"/>
                  <div className="flex items-center gap-2">
                    <Switch checked={tool.enabled} onCheckedChange={v=>updateTool(idx,'enabled',v)}/>
                    <span className="text-xs text-slate-400">{tool.enabled?'启用':'禁用'}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Layers className="h-4 w-4 text-blue-500"/>快速提示词</h3>
              <Button variant="ghost" size="sm" onClick={addPrompt} className="text-blue-500 rounded-xl text-xs"><Plus className="h-3.5 w-3.5 mr-1"/>添加</Button>
            </div>
            {config.quickPrompts.map((p:string, idx:number) => (
              <div key={idx} className="flex items-center gap-2">
                <Input value={p} onChange={e=>updatePrompt(idx,e.target.value)} className="h-9 rounded-xl bg-white border-slate-200 text-sm flex-1"/>
                <button onClick={()=>removePrompt(idx)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Settings className="h-4 w-4 text-blue-500"/>充值套餐</h3>
            {config.rechargePackages.map((pkg:any, idx:number) => (
              <div key={pkg.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">{idx+1}</div>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <Input value={pkg.label} onChange={e=>updatePkg(idx,'label',e.target.value)} className="h-8 rounded-lg bg-white border-slate-200 text-xs"/>
                  <Input type="number" value={pkg.points} onChange={e=>updatePkg(idx,'points',parseInt(e.target.value))} className="h-8 rounded-lg bg-white border-slate-200 text-xs"/>
                  <Input type="number" value={pkg.price} onChange={e=>updatePkg(idx,'price',parseFloat(e.target.value))} className="h-8 rounded-lg bg-white border-slate-200 text-xs"/>
                  <div className="flex items-center gap-2">
                    <Switch checked={pkg.popular||false} onCheckedChange={v=>updatePkg(idx,'popular',v)}/>
                    <span className="text-xs text-slate-400">推荐</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
