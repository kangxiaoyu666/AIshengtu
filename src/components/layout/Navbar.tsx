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
  const isHome = pathname === '/';

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
      isHome
        ? scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
          : 'bg-transparent'
        : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
    }`}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-lg group-hover:scale-105 transition-all">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className={`text-lg font-extrabold tracking-tight ${isHome && !scrolled ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>椒图AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? isHome && !scrolled ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
                    : isHome && !scrolled ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}><Icon className="h-4 w-4" />{link.label}</Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wallet"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              isHome && !scrolled
                ? 'bg-white/10 text-amber-300 border border-white/10 hover:bg-white/20'
                : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
            }`}>
            <Coins className="h-3.5 w-3.5" /><span>{points.toLocaleString()}</span><Plus className="h-3 w-3" /></Link>

          <Button onClick={() => router.push('/studio')}
            className="hidden md:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-9 px-5 shadow-md shadow-blue-500/20 font-semibold text-sm">
            <Zap className="h-4 w-4" />开始创作</Button>

          <Button variant="ghost" onClick={() => router.push('/login')}
            className={`hidden md:inline-flex rounded-xl h-9 ${isHome && !scrolled ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}>
            <LogIn className="h-4 w-4 mr-1.5" />登录</Button>

          <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-xl ${isHome && !scrolled ? 'text-white hover:bg-white/10' : 'hover:bg-slate-100 text-slate-500'}`}>
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
