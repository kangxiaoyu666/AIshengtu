'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Search, Image, Eye, ThumbsUp, CheckCircle, XCircle, Grid3X3, List, Cpu, Filter, ArrowUpDown } from 'lucide-react';

const demoWorks = [
  { id:1, title:'电商套图 - 夏季新品系列', user:'张三', category:'电商设计', status:'approved', likes:128, views:2400, date:'10分钟前' },
  { id:2, title:'人像精修 - 时尚大片', user:'李四', category:'人像修图', status:'approved', likes:256, views:5100, date:'25分钟前' },
  { id:3, title:'AI扩图 - 风景16:9', user:'王五', category:'风景创作', status:'pending', likes:0, views:120, date:'1小时前' },
  { id:4, title:'产品白底主图生成', user:'赵六', category:'电商设计', status:'approved', likes:89, views:1800, date:'2小时前' },
  { id:5, title:'虚拟试衣效果展示', user:'孙七', category:'虚拟试衣', status:'rejected', likes:0, views:56, date:'3小时前' },
  { id:6, title:'创意海报 - 科技博览会', user:'周八', category:'海报设计', status:'pending', likes:0, views:89, date:'4小时前' },
];

export default function WorksPage() {
  const [works] = useState(demoWorks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = works.filter((w) => {
    const ms = w.title.includes(search) || w.user.includes(search);
    const mr = statusFilter === 'all' || w.status === statusFilter;
    return ms && mr;
  });

  const handleApprove = (id: number) => { toast.success(`作品 #${id} 已通过审核`); };
  const handleReject = (id: number) => { toast.success(`作品 #${id} 已驳回`); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">作品管理</h1><p className="text-sm text-slate-500 mt-0.5">共 {works.length} 件作品</p></div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast('视图已切换')} className="text-slate-500 rounded-xl">
            <Grid3X3 className="h-4 w-4 mr-1" />视图</Button>
          <Button variant="ghost" size="sm" onClick={() => toast('排序已更改')} className="text-slate-500 rounded-xl">
            <ArrowUpDown className="h-4 w-4 mr-1" />排序</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="搜索作品或作者..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 text-sm" />
        </div>
        {['all','approved','pending','rejected'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              statusFilter === s ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>{{all:'全部',approved:'已通过',pending:'待审核',rejected:'已驳回'}[s]}</button>
        ))}
      </div>

      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
          <div className="col-span-5">作品</div><div className="col-span-2">分类</div><div className="col-span-2">互动</div><div className="col-span-1">状态</div><div className="col-span-2 text-right">操作</div>
        </div>
        {filtered.map((w) => (
          <div key={w.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center">
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Image className="h-5 w-5 text-slate-400" /></div>
              <div>
                <p className="text-sm text-slate-700 font-medium truncate">{w.title}</p>
                <p className="text-xs text-slate-400">{w.user} · {w.date}</p>
              </div>
            </div>
            <div className="col-span-2"><Badge className="bg-slate-100 text-slate-500 border-0 text-[10px]">{w.category}</Badge></div>
            <div className="col-span-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{w.views}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{w.likes}</span>
            </div>
            <div className="col-span-1">
              <Badge className={`text-[10px] border-0 ${
                w.status==='approved'?'bg-emerald-50 text-emerald-600':w.status==='rejected'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'
              }`}>{{approved:'已通过',pending:'待审核',rejected:'已驳回'}[w.status]}</Badge>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              {w.status === 'pending' && (
                <>
                  <button onClick={() => handleApprove(w.id)}
                    className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="通过"><CheckCircle className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleReject(w.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500" title="驳回"><XCircle className="h-3.5 w-3.5" /></button>
                </>
              )}
              <button onClick={() => toast(`预览作品: ${w.title}`)}
                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500" title="预览"><Eye className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
