'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { LayoutDashboard, Users, Image, Settings, Cpu, PanelLeftClose, PanelLeft, Sparkles, LogOut, Bell, Home, Receipt, FileText, Globe, Layers, Zap, CreditCard } from 'lucide-react';

const menuItems = [
  { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/works', label: '作品管理', icon: Image },
  { href: '/admin/payments', label: '充值记录', icon: Receipt },
  { href: '/admin/pointlogs', label: '点数流水', icon: FileText },
  { href: '/admin/tasks', label: '任务管理', icon: Zap },
  { href: '/admin/payment-channels', label: '支付渠道', icon: CreditCard },
  { href: '/admin/models', label: '模型配置', icon: Cpu },
  { href: '/admin/cms', label: 'CMS配置', icon: Globe },
  { href: '/admin/settings', label: '系统设置', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <aside className={`${collapsed ? 'w-[70px]' : 'w-64'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0"><Cpu className="h-4 w-4 text-white" /></div>
            {!collapsed && <span className="text-sm font-bold text-slate-800 whitespace-nowrap">后台管理</span>}
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-1">
            {menuItems.map((item) => { const Icon = item.icon; const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-800 hover:bg-[#f8fafc]'}`}>
                  <Icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{item.label}</span>}</Link>
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link href="/" className="flex items-center justify-center gap-2 p-2 rounded-xl text-xs text-slate-400 hover:text-blue-500 hover:bg-blue-50"><Home className="h-3.5 w-3.5" />{!collapsed && '返回前台'}</Link>
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:bg-[#f8fafc]">{collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold text-slate-700">后台管理系统</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => toast('暂无新通知')} className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-400"><Bell className="h-4 w-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" /></button>
            <Avatar className="h-8 w-8 bg-blue-500"><Cpu className="h-4 w-4 text-white" /></Avatar>
            <button onClick={() => { toast.success('已退出'); router.push('/'); }} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><LogOut className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-auto relative"><div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" /><div className="relative z-10">{children}</div></div>
      </div>
    </div>
  );
}
