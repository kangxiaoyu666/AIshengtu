'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Image, Zap, TrendingUp, ArrowUp, ArrowDown, Activity, Eye, ThumbsUp, ChevronDown, Sparkles, Cpu, DollarSign, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/orders').then(r => r.json()),
    ]).then(([usersData, ordersData]) => {
      const paidOrders = (ordersData.orders || []).filter((o: any) => o.status === 'paid');
      setStats({
        users: usersData.total || 0,
        orders: ordersData.total || 0,
        revenue: paidOrders.reduce((s: number, o: any) => s + o.amountCent / 100, 0),
        activeUsers: usersData.users?.filter((u: any) => u.status === 'active').length || 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: '总用户数', value: loading ? '...' : stats.users.toLocaleString(), change: '+12.5%', up: true, icon: Users, gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50' },
    { label: '活跃用户', value: loading ? '...' : stats.activeUsers.toLocaleString(), change: '+8.2%', up: true, icon: Activity, gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50' },
    { label: '充值总额', value: loading ? '...' : `¥${stats.revenue.toFixed(2)}`, change: '+23.1%', up: true, icon: DollarSign, gradient: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50' },
    { label: '充值订单', value: loading ? '...' : stats.orders.toString(), change: '-3.4%', up: false, icon: Zap, gradient: 'from-purple-500 to-violet-600', bgLight: 'bg-purple-50' },
  ];

  const recentWorks = [
    { user: '张三', prompt: '把背景换成海边日落', status: 'completed', time: '2分钟前' },
    { user: '李四', prompt: '生成电商产品白底主图', status: 'processing', time: '5分钟前' },
    { user: '王五', prompt: '给模特换红色连衣裙', status: 'completed', time: '8分钟前' },
    { user: '赵六', prompt: '修复老照片去噪上色', status: 'completed', time: '12分钟前' },
  ];

  const modelUsage = [
    { name: 'GPT-4o', pct: 45, color: 'from-blue-400 to-blue-600' },
    { name: 'GPT-4o Mini', pct: 28, color: 'from-cyan-400 to-cyan-600' },
    { name: 'Claude 3.5', pct: 16, color: 'from-purple-400 to-purple-600' },
    { name: 'Gemini 2.0', pct: 7, color: 'from-emerald-400 to-emerald-600' },
    { name: '其他', pct: 4, color: 'from-slate-300 to-slate-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">仪表盘</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="glow-dot-green" />
              <span className="text-[10px] text-emerald-600 font-semibold">系统运行中</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">系统运行状态概览 · 实时数据</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { toast.success('数据已刷新'); window.location.reload(); }}
          className="text-slate-500 rounded-xl hover:bg-slate-100">
          最近7天 <ChevronDown className="h-3.5 w-3.5 ml-1" /></Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}
            onClick={() => toast(`${stat.label}: ${stat.value}`)}
            className="stat-card cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 text-white" /></div>
              <Badge className={`text-[10px] border-0 font-medium ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {stat.up ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}{stat.change}</Badge>
            </div>
            <p className="text-[28px] font-extrabold text-slate-800 tracking-tight">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* API Trend Chart */}
        <Card className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 depth-1 hover:depth-2 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">API 调用趋势</h3>
              <p className="text-xs text-slate-500 mt-0.5">近7天调用量统计</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 text-[10px] border-0 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />+18.3%</Badge>
          </div>
          <div className="h-52 flex items-end gap-2.5 px-2">
            {[35, 52, 48, 70, 65, 82, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">{h}K</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-100 to-blue-400 hover:from-blue-200 hover:to-blue-500 transition-all"
                  style={{ height: `${h}%` }}>
                  <div className="w-full h-full rounded-t-lg bg-gradient-to-t from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Model Usage */}
        <Card className="bg-white border border-slate-200/80 rounded-2xl p-6 depth-1 hover:depth-2 transition-all">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-800">模型用量分布</h3>
            <Cpu className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-4">
            {modelUsage.map((m) => (
              <div key={m.name} className="cursor-pointer group">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">{m.name}</span>
                  <span className="text-blue-600 font-semibold">{m.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-500 group-hover:opacity-80`}
                    style={{ width: `${m.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Works */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl p-6 depth-1">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">最近作品</h3>
            <p className="text-xs text-slate-500 mt-0.5">实时作品生成记录</p>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-500 rounded-xl text-xs hover:bg-blue-50">查看全部 →</Button>
        </div>
        <div className="space-y-1">
          {recentWorks.map((w, i) => (
            <div key={i}
              className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  w.status === 'completed' ? 'bg-emerald-50' : w.status === 'processing' ? 'bg-amber-50' : 'bg-red-50'
                }`}>
                  <Image className={`h-4 w-4 ${
                    w.status === 'completed' ? 'text-emerald-500' : w.status === 'processing' ? 'text-amber-500' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{w.prompt}</p>
                  <p className="text-xs text-slate-400">{w.user} · {w.time}</p>
                </div>
              </div>
              <Badge className={`text-[10px] border-0 font-medium ${
                w.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                w.status === 'processing' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
              }`}>
                {w.status === 'completed' ? '已完成' : w.status === 'processing' ? '处理中' : '失败'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
