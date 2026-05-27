'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, ArrowUp, ArrowDown, Loader2, FileText } from 'lucide-react';

interface Log { id:string; userId:string; changePoints:number; type:string; remark:string; relatedOrderId?:string; createdAt:string; }
interface GenLog { id:string; userId:string; prompt:string; model:string; pointsCost:number; status:string; createdAt:string; }

export default function PointLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [genLogs, setGenLogs] = useState<GenLog[]>([]);
  const [tab, setTab] = useState<'points'|'generate'>('points');
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const r = await window.fetch(`/api/admin/pointlogs?type=${t}`); const d = await r.json();
      if (t==='points') setLogs(d.logs||[]);
      else setGenLogs(d.logs||[]);
    } catch { toast.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(tab); }, [tab, fetch]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">点数流水</h1><p className="text-sm text-slate-500 mt-0.5">所有点数变动记录 · 不可篡改</p></div>
        <Button variant="ghost" size="sm" onClick={() => fetch(tab)} className="text-slate-500 rounded-xl"><RefreshCw className={`h-4 w-4 mr-1.5 ${loading?'animate-spin':''}`}/>刷新</Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('points')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab==='points'?'bg-blue-50 text-blue-600':'text-slate-500'}`}>点数流水</button>
        <button onClick={() => setTab('generate')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab==='generate'?'bg-blue-50 text-blue-600':'text-slate-500'}`}>AI生成记录</button>
      </div>

      {tab === 'points' ? (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
            <div className="col-span-2">用户ID</div><div className="col-span-1">变动</div><div className="col-span-1">类型</div><div className="col-span-4">备注</div><div className="col-span-2">关联订单</div><div className="col-span-2">时间</div>
          </div>
          {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400"/></div>
          : logs.length===0 ? <div className="text-center py-16 text-slate-400"><FileText className="h-10 w-10 mx-auto mb-2 opacity-50"/><p className="text-sm">暂无流水记录</p></div>
          : logs.map(l=>(
            <div key={l.id} className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 items-center">
              <div className="col-span-2 text-xs text-slate-500 font-mono">{l.userId?.slice(-12)}</div>
              <div className={`col-span-1 text-sm font-bold ${l.changePoints>0?'text-emerald-600':'text-red-500'}`}>
                {l.changePoints>0?<ArrowUp className="h-3 w-3 inline mr-0.5"/>:<ArrowDown className="h-3 w-3 inline mr-0.5"/>}{Math.abs(l.changePoints)}</div>
              <div className="col-span-1"><Badge className={`text-[10px] border-0 ${l.type==='recharge'?'bg-emerald-50 text-emerald-600':l.type==='refund'?'bg-amber-50 text-amber-600':l.type==='generate_image'?'bg-blue-50 text-blue-600':'bg-slate-100 text-slate-500'}`}>
                {{recharge:'充值',generate_image:'生图',refund:'退款',manual:'手动'}[l.type]}</Badge></div>
              <div className="col-span-4 text-xs text-slate-600 truncate">{l.remark}</div>
              <div className="col-span-2 text-[10px] font-mono text-slate-400 truncate">{l.relatedOrderId?.slice(-12) || '-'}</div>
              <div className="col-span-2 text-xs text-slate-400">{new Date(l.createdAt).toLocaleString('zh-CN')}</div>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
            <div className="col-span-2">用户ID</div><div className="col-span-3">提示词</div><div className="col-span-1">消耗</div><div className="col-span-1">状态</div><div className="col-span-3">模型</div><div className="col-span-2">时间</div>
          </div>
          {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400"/></div>
          : genLogs.length===0 ? <div className="text-center py-16 text-slate-400"><FileText className="h-10 w-10 mx-auto mb-2 opacity-50"/><p className="text-sm">暂无生成记录</p></div>
          : genLogs.map(l=>(
            <div key={l.id} className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 items-center">
              <div className="col-span-2 text-xs text-slate-500 font-mono">{l.userId?.slice(-12)}</div>
              <div className="col-span-3 text-xs text-slate-600 truncate">{l.prompt}</div>
              <div className="col-span-1 text-sm text-slate-700 font-medium">{l.pointsCost}</div>
              <div className="col-span-1"><Badge className={`text-[10px] border-0 ${l.status==='success'?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-500'}`}>{l.status==='success'?'成功':'失败'}</Badge></div>
              <div className="col-span-3 text-xs text-slate-400 truncate">{l.model}</div>
              <div className="col-span-2 text-xs text-slate-400">{new Date(l.createdAt).toLocaleString('zh-CN')}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
