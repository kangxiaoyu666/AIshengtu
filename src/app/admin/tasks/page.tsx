'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, RefreshCw, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Play, Layers, Zap, Cpu } from 'lucide-react';

interface TaskItem {
  id: string; taskNo: string; userId: string; userName: string; userEmail: string;
  prompt: string; model: string; pointsCost: number; status: string; result: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
  queued:    { label: '排队中', icon: Clock, bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
  running:   { label: '生成中', icon: Play, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  succeeded: { label: '已完成', icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  failed:    { label: '失败', icon: XCircle, bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' },
  reviewed_failed: { label: '违规', icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await window.fetch('/api/admin/tasks');
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch { toast.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = tasks.filter(t => {
    const ms = t.prompt.includes(search) || t.userName.includes(search) || t.taskNo.includes(search);
    const mr = statusFilter === 'all' || t.status === statusFilter;
    return ms && mr;
  });

  const counts = {
    all: tasks.length,
    running: tasks.filter(t => t.status === 'running').length,
    succeeded: tasks.filter(t => t.status === 'succeeded').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">任务管理</h1>
            <Badge className="bg-purple-50 text-purple-600 border-0 text-[10px] font-semibold">{tasks.length} 个任务</Badge>
          </div>
          <p className="text-sm text-slate-500">AI生成任务队列 · 实时状态跟踪</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetch} className="text-slate-500 rounded-xl hover:bg-slate-100">
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />刷新</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '全部任务', value: counts.all, icon: Layers, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: '生成中', value: counts.running, icon: Play, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: '已完成', value: counts.succeeded, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: '失败', value: counts.failed, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <button key={s.label} onClick={() => setStatusFilter(s.label === '全部任务' ? 'all' : s.label === '生成中' ? 'running' : s.label === '已完成' ? 'succeeded' : 'failed')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 hover:depth-1 transition-all">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div className="text-left">
              <p className="text-xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="搜索任务号/提示词/用户名..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-slate-700 text-sm" />
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1">
          {[
            { value: 'all', label: '全部' },
            { value: 'running', label: '生成中' },
            { value: 'succeeded', label: '已完成' },
            { value: 'failed', label: '失败' },
          ].map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f.value ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden depth-1">
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 font-semibold tracking-wide">
          <div className="col-span-2">任务号</div>
          <div className="col-span-3">提示词 / 用户</div>
          <div className="col-span-1">模型</div>
          <div className="col-span-1">点数</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">时间</div>
          <div className="col-span-1 text-right">操作</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">暂无任务记录</p>
            <p className="text-xs mt-1">用户在前台提交AI生成任务后会出现在这里</p>
          </div>
        ) : (
          filtered.map(t => {
            const s = statusConfig[t.status] || statusConfig.queued;
            const StatusIcon = s.icon;
            return (
              <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors items-center">
                <div className="col-span-2">
                  <p className="text-xs font-mono text-slate-500">{t.taskNo}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-slate-700 truncate font-medium">{t.prompt}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.userName} · {t.userEmail}</p>
                </div>
                <div className="col-span-1">
                  <Badge className="bg-slate-100 text-slate-500 border-0 text-[10px]">{t.model}</Badge>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-slate-600 font-medium">{t.pointsCost}</span>
                  <span className="text-xs text-slate-400 ml-0.5">点</span>
                </div>
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${s.bg} ${s.text} border ${s.border} text-[11px] font-medium`}>
                    <StatusIcon className="h-3 w-3" />{s.label}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString('zh-CN')}</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => toast(`任务详情: ${t.taskNo}`)}
                    className="rounded-lg text-xs text-slate-400 hover:text-blue-500">详情</Button>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
