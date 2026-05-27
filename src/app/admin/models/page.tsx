'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Cpu, Plus, Pencil, Trash2, Save, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const typeLabels: Record<string,string> = { openai:'OpenAI兼容', anthropic:'Anthropic', gemini:'Gemini', custom:'自定义' };

interface ModelConfig {
  id: string; name: string; type: string; endpoint: string; modelName: string; apiKey: string;
  pointsPerUse: number; priority: number; enabled: boolean;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string>('');
  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    name:'', type:'openai', endpoint:'', modelName:'', apiKey:'', pointsPerUse:2, priority:1, enabled:true
  });

  useEffect(() => {
    fetch('/api/admin/models').then(r=>r.json()).then(d => {
      if(d.models) setModels(d.models);
    }).catch(()=>{});
  }, []);

  const addModel = async () => {
    if(!newModel.name || !newModel.endpoint || !newModel.modelName) { toast.error('请填写必要字段'); return; }
    try {
      const res = await fetch('/api/admin/models', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...newModel, id:'m-'+Date.now()})
      });
      const d = await res.json();
      if(d.success) { toast.success('模型已添加'); setModels(d.models || [...models, d.model]); setShowAdd(false); setNewModel({name:'',type:'openai',endpoint:'',modelName:'',apiKey:'',pointsPerUse:2,priority:1,enabled:true}); }
    } catch { toast.error('添加失败'); }
  };

  const toggleModel = async (id: string) => {
    const m = models.find(mm=>mm.id===id); if(!m) return;
    try {
      const res = await fetch('/api/admin/models', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id, enabled: !m.enabled})
      });
      const d = await res.json();
      if(d.success) { toast.success(m.enabled?'已禁用':'已启用'); setModels(models.map(mm=>mm.id===id?{...mm,enabled:!m.enabled}:mm)); }
    } catch { toast.error('操作失败'); }
  };

  const deleteModel = async (id: string) => {
    if(!confirm('确定删除该模型配置？')) return;
    try {
      const res = await fetch(`/api/admin/models?id=${id}`, { method:'DELETE' });
      const d = await res.json();
      if(d.success) { toast.success('已删除'); setModels(models.filter(m=>m.id!==id)); }
      else { toast.error(d.error||'删除失败'); }
    } catch { toast.error('删除失败'); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">模型配置</h1><p className="text-sm text-slate-500 mt-0.5">配置多个大模型平台API接口，共{models.length}个模型</p></div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md shadow-blue-500/20">
          <Plus className="h-3.5 w-3.5 mr-1.5" />添加模型</Button>
      </div>

      {showAdd && (
        <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">新建模型</h3>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="text-xs text-slate-500">模型名称 *</Label><Input value={newModel.name} onChange={(e)=>setNewModel({...newModel,name:e.target.value})} placeholder="GPT-4o" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
            <div><Label className="text-xs text-slate-500">平台类型</Label>
              <Select value={newModel.type} onValueChange={(v)=>setNewModel({...newModel,type:v||'openai'})}>
                <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs text-slate-500">API端点 *</Label><Input value={newModel.endpoint} onChange={(e)=>setNewModel({...newModel,endpoint:e.target.value})} placeholder="https://api.openai.com/v1" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
            <div><Label className="text-xs text-slate-500">模型标识名 *</Label><Input value={newModel.modelName} onChange={(e)=>setNewModel({...newModel,modelName:e.target.value})} placeholder="gpt-4o" className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
            <div><Label className="text-xs text-slate-500">API Key</Label><Input value={newModel.apiKey} onChange={(e)=>setNewModel({...newModel,apiKey:e.target.value})} placeholder="sk-..." className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 font-mono text-xs" /></div>
            <div><Label className="text-xs text-slate-500">每次消耗点数</Label><Input type="number" value={newModel.pointsPerUse} onChange={(e)=>setNewModel({...newModel,pointsPerUse:parseInt(e.target.value)})} className="h-9 rounded-xl bg-white border-slate-200 text-slate-700 mt-1 text-sm" /></div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={()=>setShowAdd(false)} className="rounded-xl">取消</Button>
            <Button onClick={addModel} size="sm" className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"><Save className="h-3.5 w-3.5 mr-1.5"/>添加模型</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m) => (
          <Card key={m.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${m.enabled ? 'border-slate-200 hover:shadow-md' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.enabled?'bg-blue-50':'bg-slate-100'}`}>
                  <Cpu className={`h-4 w-4 ${m.enabled?'text-blue-500':'text-slate-400'}`} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{m.modelName}</p>
                </div>
              </div>
              <Badge className={`text-[10px] border-0 ${m.enabled?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-400'}`}>
                {m.enabled?'启用':'禁用'}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge className="bg-slate-100 text-slate-500 border-0 text-[10px]">{typeLabels[m.type]}</Badge>
              <Badge className="bg-amber-50 text-amber-600 border-0 text-[10px]">{m.pointsPerUse}点/次</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => toggleModel(m.id)}
                className={`rounded-xl text-xs ${m.enabled?'text-slate-400 hover:text-amber-600':'text-slate-400 hover:text-emerald-600'}`}>
                {m.enabled ? '禁用' : '启用'}</Button>
              <Button variant="ghost" size="sm" onClick={() => toast('编辑功能开发中')}
                className="rounded-xl text-xs text-slate-400 hover:text-blue-500"><Pencil className="h-3 w-3 mr-0.5"/>编辑</Button>
              <Button variant="ghost" size="sm" onClick={() => deleteModel(m.id)}
                className="rounded-xl text-xs text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3 mr-0.5"/>删除</Button>
            </div>
          </Card>
        ))}
        {models.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Cpu className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无模型配置</p>
            <p className="text-xs mt-1">点击"添加模型"配置第一个大模型平台</p>
          </div>
        )}
      </div>
    </div>
  );
}
