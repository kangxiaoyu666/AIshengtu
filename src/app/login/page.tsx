'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cpu, Mail, Lock, Eye, EyeOff, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('请填写邮箱和密码'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error('登录失败');
      const data = await res.json();
      localStorage.setItem('jiaotu_user', JSON.stringify(data.user));
      toast.success('登录成功！正在跳转...');
      setTimeout(() => router.push('/studio'), 500);
    } catch { toast.error('登录失败，请检查邮箱和密码'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 relative bg-[#f5f7fa]">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-100/40 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">造境 AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">欢迎回来</h1>
          <p className="text-sm text-slate-500">登录你的账号继续创作</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input type="email" placeholder="邮箱地址" value={email} onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:ring-blue-100" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input type={showPassword ? 'text' : 'password'} placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-xl bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:ring-blue-100" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md shadow-blue-500/20 font-medium text-base">
            {loading ? <><Sparkles className="h-4 w-4 mr-2 animate-spin" />登录中...</> : <><ArrowRight className="h-4 w-4 mr-2" />登录</>}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            还没有账号？<Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">立即注册</Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-blue-500 transition-colors">← 返回首页</Link>
        </div>
      </Card>
    </div>
  );
}
