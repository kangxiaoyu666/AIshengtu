'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Download, CheckCircle, XCircle, Clock, Ban, Shield, User, RefreshCw, Loader2, Trash2, Users as UsersIcon } from 'lucide-react';

interface UserData {
  id: string; email: string; name: string; role: string; status: string;
  avatar?: string; works: number; createdAt: string; updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string>('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const ms = u.name.includes(search) || u.email.includes(search);
    const mr = roleFilter === 'all' || u.role === roleFilter;
    return ms && mr;
  });

  const handleAction = async (id: string, action: string, value?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, value }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`操作成功`);
        fetchUsers();
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该用户？此操作不可恢复。')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('用户已删除'); fetchUsers(); }
      else { toast.error(data.error || '删除失败'); }
    } catch { toast.error('删除失败'); }
  };

  const handleExport = () => {
    const csv = '姓名,邮箱,角色,状态,作品数,注册时间\n' + users.map(u => `${u.name},${u.email},${u.role},${u.status},${u.works},${u.createdAt}`).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
    toast.success('导出成功');
  };

  const roleConfig: Record<string, { label: string; bg: string; text: string }> = {
    admin: { label: '管理员', bg: 'bg-blue-50', text: 'text-blue-600' },
    designer: { label: '设计师', bg: 'bg-purple-50', text: 'text-purple-600' },
    user: { label: '用户', bg: 'bg-slate-100', text: 'text-slate-500' },
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    active: { label: '正常', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    banned: { label: '封禁', bg: 'bg-red-50', text: 'text-red-500' },
    pending: { label: '待审', bg: 'bg-amber-50', text: 'text-amber-600' },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">用户管理</h1>
            <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px] font-semibold">{users.length} 位用户</Badge>
          </div>
          <p className="text-sm text-slate-500">数据来源：服务端实时存储 · 前台注册自动同步</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-slate-500 rounded-xl hover:bg-slate-100">
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />刷新</Button>
          <Button variant="ghost" size="sm" onClick={handleExport} className="text-slate-500 rounded-xl hover:bg-slate-100">
            <Download className="h-4 w-4 mr-1.5" />导出CSV</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="搜索用户名或邮箱..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 text-sm focus:border-blue-300" />
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1">
          {[
            { value: 'all', label: '全部' },
            { value: 'admin', label: '管理员' },
            { value: 'designer', label: '设计师' },
            { value: 'user', label: '用户' },
          ].map((r) => (
            <button key={r.value} onClick={() => setRoleFilter(r.value)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r.value
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}>{r.label}</button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden depth-1">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 font-semibold tracking-wide">
          <div className="col-span-4">用户信息</div>
          <div className="col-span-2">角色</div>
          <div className="col-span-2">作品数</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2 text-right">操作</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> 加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">{search || roleFilter !== 'all' ? '无匹配用户' : '暂无注册用户'}</p>
            <p className="text-xs mt-1 text-slate-400">{search || roleFilter !== 'all' ? '' : '用户在前台注册后会出现在这里'}</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.id}
              className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors items-center">
              {/* User info */}
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                  u.role === 'admin' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                  u.role === 'designer' ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white' :
                  'bg-slate-100 text-slate-500'
                }`}>{u.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <p className="text-sm text-slate-700 font-semibold">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <Badge className={`text-[10px] border-0 font-medium ${roleConfig[u.role]?.bg} ${roleConfig[u.role]?.text}`}>
                  {roleConfig[u.role]?.label || u.role}</Badge>
              </div>

              {/* Works */}
              <div className="col-span-2">
                <span className="text-sm text-slate-600 font-medium">{u.works}</span>
                <span className="text-xs text-slate-400 ml-1">件</span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <Badge className={`text-[10px] border-0 font-medium ${statusConfig[u.status]?.bg} ${statusConfig[u.status]?.text}`}>
                  {statusConfig[u.status]?.label || u.status}</Badge>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                {actionLoading === u.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <div className="flex items-center gap-0.5 bg-slate-50 rounded-xl p-0.5">
                    {u.status === 'active' && u.role !== 'admin' && (
                      <button onClick={() => handleAction(u.id, 'status', 'banned')}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="封禁">
                        <Ban className="h-3.5 w-3.5" /></button>
                    )}
                    {u.status === 'banned' && (
                      <button onClick={() => handleAction(u.id, 'status', 'active')}
                        className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-colors" title="解封">
                        <CheckCircle className="h-3.5 w-3.5" /></button>
                    )}
                    <button onClick={() => handleAction(u.id, 'role', u.role === 'user' ? 'designer' : 'user')}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors" title="切换角色">
                      <Shield className="h-3.5 w-3.5" /></button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="删除">
                        <Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
