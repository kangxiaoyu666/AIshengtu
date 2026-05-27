'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { toast.error('请填写邮箱和密码'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('zj_user', JSON.stringify({ token: data.data.token, user: data.data.user }));
        document.cookie = `zj_token=${data.data.token};path=/;max-age=604800`;
        toast.success('登录成功');
        router.push('/');
      } else {
        toast.error(data.error || '登录失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7ff] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-xl border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">欢迎回来</h1>
          <p className="text-sm text-slate-400 mt-1">登录造境 AI 创作平台</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input type="email" placeholder="邮箱地址" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="pl-10 h-11 rounded-xl border-slate-200" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input type="password" placeholder="密码" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="pl-10 h-11 rounded-xl border-slate-200" />
          </div>

          <Button onClick={handleLogin} disabled={loading}
            className="w-full h-11 rounded-xl btn-brand text-sm font-semibold gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? '登录中...' : '登录'}
          </Button>

          <p className="text-center text-sm text-slate-400">
            还没有账号？
            <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium ml-1">注册</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
