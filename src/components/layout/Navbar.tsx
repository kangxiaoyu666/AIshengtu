'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, Video, Grid3X3, LogIn, Menu, X, Zap, Cpu, Coins, Plus } from 'lucide-react';
import { getWallet } from '@/lib/wallet';

const navLinks = [
  { href: '/studio', label: '创作工坊', icon: Image },
  { href: '/video', label: 'AI 视频', icon: Video },
  { href: '/gallery', label: '灵感广场', icon: Grid3X3 },
];

export default function Navbar() {
  const router = useRouter(); const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const refreshPoints = () => setPoints(getWallet().points);
  useEffect(() => { refreshPoints(); const h = () => refreshPoints(); window.addEventListener('wallet-changed', h); return () => window.removeEventListener('wallet-changed', h); }, []);
  useEffect(() => { refreshPoints(); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300 ${
      scrolled
        ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md shadow-blue-400/20 group-hover:shadow-lg group-hover:scale-105 transition-all">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">造境 AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}><Icon className="h-4 w-4" />{link.label}</Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wallet"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-all text-sm font-semibold">
            <Coins className="h-3.5 w-3.5" /><span>{points.toLocaleString()}</span><Plus className="h-3 w-3 text-amber-400" /></Link>

          <Button onClick={() => router.push('/studio')}
            className="hidden md:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white border-0 h-9 px-5 shadow-md shadow-blue-400/20 font-semibold text-sm">
            <Zap className="h-4 w-4" />开始创作</Button>

          <Button variant="ghost" onClick={() => router.push('/login')}
            className="hidden md:inline-flex rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 h-9">
            <LogIn className="h-4 w-4 mr-1.5" />登录</Button>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg">
          <Link href="/wallet" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 text-amber-600 font-medium">
            <Coins className="h-4 w-4" />余额: {points.toLocaleString()} 点</Link>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                <Icon className="h-4 w-4" />{link.label}</Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
