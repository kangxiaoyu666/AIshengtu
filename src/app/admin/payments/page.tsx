'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, DollarSign, TrendingUp, Receipt, Loader2 } from 'lucide-react';

interface Order { id:string; userId:string; outTradeNo:string; amountCent:number; points:number; status:string; wechatTransactionId?:string; paidAt?:string; createdAt:string; }

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await window.fetch('/api/admin/orders'); const d = await r.json();
      setOrders(d.orders || []);
    } catch { toast.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const totalRevenue = orders.filter(o=>o.status==='paid').reduce((s,o)=>s+o.amountCent/100,0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">充值订单</h1><p className="text-sm text-slate-500 mt-0.5">共{orders.length}笔订单 · 数据来源：服务端DB</p></div>
        <Button variant="ghost" size="sm" onClick={fetch} className="text-slate-500 rounded-xl"><RefreshCw className={`h-4 w-4 mr-1.5 ${loading?'animate-spin':''}`}/>刷新</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'总收入',value:`¥${totalRevenue.toFixed(2)}`,icon:DollarSign,color:'text-emerald-600',bg:'bg-emerald-50'},
          {label:'已支付',value:orders.filter(o=>o.status==='paid').length,icon:TrendingUp,color:'text-blue-600',bg:'bg-blue-50'},
          {label:'待支付',value:orders.filter(o=>o.status==='pending').length,icon:Receipt,color:'text-amber-600',bg:'bg-amber-50'},
        ].map(s=>(
          <Card key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`h-5 w-5 ${s.color}`}/></div>
              <div><p className="text-2xl font-bold text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div></div>
          </Card>
        ))}
      </div>

      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
          <div className="col-span-2">订单号</div><div className="col-span-2">用户ID</div><div className="col-span-1">点数</div><div className="col-span-1">金额</div><div className="col-span-1">状态</div><div className="col-span-2">微信交易号</div><div className="col-span-2">时间</div><div className="col-span-1 text-right">操作</div>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400"/></div>
        : orders.length===0 ? <div className="text-center py-16 text-slate-400"><Receipt className="h-10 w-10 mx-auto mb-2 opacity-50"/><p className="text-sm">暂无充值订单</p></div>
        : orders.map(o=>(
          <div key={o.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center">
            <div className="col-span-2 text-xs font-mono text-slate-600 truncate">{o.outTradeNo?.slice(-12)}</div>
            <div className="col-span-2 text-xs text-slate-500 truncate">{o.userId}</div>
            <div className="col-span-1 text-sm text-slate-700 font-medium">{o.points}</div>
            <div className="col-span-1 text-sm text-slate-600">¥{o.amountCent/100}</div>
            <div className="col-span-1"><Badge className={`text-[10px] border-0 ${o.status==='paid'?'bg-emerald-50 text-emerald-600':o.status==='closed'?'bg-slate-100 text-slate-500':'bg-amber-50 text-amber-600'}`}>
              {{paid:'已支付',pending:'待支付',closed:'已关闭',refunded:'已退款'}[o.status]}</Badge></div>
            <div className="col-span-2 text-[10px] font-mono text-slate-400 truncate">{o.wechatTransactionId || '-'}</div>
            <div className="col-span-2 text-xs text-slate-400">{o.paidAt ? new Date(o.paidAt).toLocaleString('zh-CN') : new Date(o.createdAt).toLocaleString('zh-CN')}</div>
            <div className="col-span-1 text-right"></div>
          </div>
        ))}
      </Card>
    </div>
  );
}
