'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) { toast.error('请填写所有字段'); return; }
    if (password.length < 6) { toast.error('密码至少6位'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('zj_user', JSON.stringify({ token: data.data.token, user: data.data.user }));
        document.cookie = `zj_token=${data.data.token};path=/;max-age=604800`;
        toast.success('注册成功！赠送10点数');
        router.push('/');
      } else {
        toast.error(data.error || '注册失败');
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
          <h1 className="text-2xl font-extrabold text-slate-800">创建账号</h1>
          <p className="text-sm text-slate-400 mt-1">注册造境 AI，开始创作</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="昵称" value={name}
              onChange={e => setName(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input type="email" placeholder="邮箱地址" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className="pl-10 h-11 rounded-xl border-slate-200" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input type="password" placeholder="密码（至少6位）" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className="pl-10 h-11 rounded-xl border-slate-200" />
          </div>

          <Button onClick={handleRegister} disabled={loading}
            className="w-full h-11 rounded-xl btn-brand text-sm font-semibold gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? '注册中...' : '注册'}
          </Button>

          <p className="text-center text-sm text-slate-400">
            已有账号？
            <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium ml-1">登录</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
