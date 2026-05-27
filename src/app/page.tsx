'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Zap, Upload, ArrowRight, Scissors, Expand, Shirt, Camera,
  Wand2, ZoomIn, Palette, Layers, ShoppingBag, Video,
  ChevronRight, Cpu, Activity, Shield, Globe, Brain, Star, MessageSquare, Lightbulb, Image
} from 'lucide-react';

const iconMap: Record<string, any> = {
  ShoppingBag, Scissors, Expand, Shirt, Camera, Wand2, ZoomIn, Layers, Palette, Video, Activity, Globe, Shield
};

const quickActions = [
  { icon: ShoppingBag, label: '生成商品主图', color: 'bg-blue-50 text-blue-500' },
  { icon: Layers, label: '生成海报', color: 'bg-purple-50 text-purple-500' },
  { icon: Scissors, label: '去背景', color: 'bg-cyan-50 text-cyan-500' },
  { icon: Expand, label: 'AI 扩图', color: 'bg-indigo-50 text-indigo-500' },
  { icon: Camera, label: '证件照', color: 'bg-pink-50 text-pink-500' },
  { icon: Wand2, label: '一句话修图', color: 'bg-amber-50 text-amber-500' },
];

const highlightTools = [
  { icon: Image, title: 'AI 文生图', desc: '一句话生成高质量图片', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
  { icon: Wand2, title: 'AI 修图', desc: '智能修复、增强、美化', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
  { icon: ShoppingBag, title: 'AI 商品图', desc: '一键生成电商套图', color: 'from-cyan-400 to-cyan-600', bg: 'bg-cyan-50' },
  { icon: Layers, title: 'AI 海报', desc: '智能排版创意设计', color: 'from-pink-400 to-pink-600', bg: 'bg-pink-50' },
  { icon: Scissors, title: 'AI 抠图', desc: '精准主体识别去背景', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50' },
  { icon: Expand, title: 'AI 扩图', desc: '智能扩展画面边界', color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50' },
];

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => { try { const r = await window.fetch('/api/cms/config'); setConfig(await r.json()); } catch {} })();
  }, []);

  if (!config) return (
    <div className="flex justify-center py-40 min-h-screen bg-outer-dark">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse" />
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );

  const { tools, quickPrompts, stats } = config;
  const handleNavigate = (p?: string) => {
    const q = p || prompt.trim();
    router.push(q ? `/studio?prompt=${encodeURIComponent(q)}` : '/studio');
  };

  return (
    <div className="flex flex-col items-center bg-outer-dark overflow-hidden min-h-screen">
      {/* ===== Outer dark bg with decorations ===== */}
      <div className="fixed inset-0 bg-grid-subtle pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-500/[0.04] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-t from-purple-500/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ===== Main Stage Card ===== */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-10">
        <div className="stage-card overflow-hidden">
          
          {/* Hero Section */}
          <section className="relative px-6 md:px-12 pt-12 pb-8 bg-glow-top">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Left: Text + Input */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                  <div className="accent-dot" />
                  <span className="text-xs text-blue-600 font-semibold">椒图AI v2.0</span>
                  <Badge className="bg-blue-500 text-white border-0 text-[10px]">AI</Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 leading-[1.1]">
                  <span className="text-slate-800">造境 </span>
                  <span className="gradient-text-brand">AI 创作助手</span>
                </h1>
                <p className="text-lg text-slate-400 mb-2 font-medium">智能图像创作中心</p>
                <p className="text-sm text-slate-500 mb-8 max-w-lg">支持文生图、AI修图、电商作图、海报设计，一站式完成创作与管理</p>

                {/* Hero Input */}
                <div className="w-full max-w-xl">
                  <div className="hero-input-wrap flex items-start">
                    <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      placeholder="一句话生成你的创意视觉..."
                      className="flex-1 resize-none bg-transparent border-0 text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 py-5 px-5 pr-28 text-base min-h-[60px]"
                      rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNavigate(); } }} />
                    <div className="flex items-center gap-1.5 py-3 pr-3">
                      <label className="cursor-pointer p-2.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all">
                        <Upload className="h-4 w-4" /><Input ref={fileInputRef} type="file" accept="image/*" className="hidden" /></label>
                      <Button onClick={() => handleNavigate()} size="icon"
                        className="h-10 w-10 rounded-xl btn-primary-gradient">
                        <ArrowRight className="h-5 w-5" /></Button>
                    </div>
                  </div>
                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {quickActions.map((a) => (
                      <button key={a.label} onClick={() => handleNavigate(a.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${a.color} hover:opacity-80 transition-all`}>
                        <a.icon className="h-3.5 w-3.5" />{a.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: AI Illustration */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-72 h-72 lg:w-80 lg:h-80">
                  {/* AI chip illustration */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100 via-purple-50 to-cyan-50 border border-blue-100/50 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-subtle opacity-30" />
                    {/* AI core */}
                    <div className="relative z-10">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-400/20 animate-glow">
                        <Brain className="h-14 w-14 text-white" />
                      </div>
                      {/* Orbit rings */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-blue-200/40 animate-spin" style={{animationDuration:'12s'}} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-purple-200/30 animate-spin" style={{animationDuration:'18s', animationDirection:'reverse'}} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="soft-divider mx-12" />

          {/* Core Tools Matrix */}
          <section className="px-6 md:px-12 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="accent-dot-blue" />
              <h2 className="text-xl font-extrabold text-slate-800">核心能力</h2>
              <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px]">AI Powered</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {highlightTools.map((t) => (
                <div key={t.title} onClick={() => handleNavigate(t.title)}
                  className="func-card text-center group">
                  <div className={`func-icon bg-gradient-to-br ${t.color} mx-auto shadow-md`}>
                    <t.icon className="h-5 w-5 text-white" /></div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{t.title}</h3>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="soft-divider mx-12" />

          {/* Quick Prompts + Stats */}
          <section className="px-6 md:px-12 py-8">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* AI Assistant Card */}
              <div className="ai-assistant-card p-6 cursor-pointer" onClick={() => router.push('/studio')}>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-bold">智能助手</span>
                  </div>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">告诉我你想做什么，AI帮你选择最佳方案</p>
                  <div className="space-y-2">
                    {['帮我生成电商产品主图', '把这张照片背景换成海边', '修复这张老照片'].map((q,i) => (
                      <div key={i} onClick={(e) => { e.stopPropagation(); handleNavigate(q); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs transition-all">
                        <MessageSquare className="h-3 w-3 shrink-0" />{q}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" />热门创作任务</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickPrompts.slice(0, 8).map((p: string, i: number) => (
                    <div key={i} onClick={() => handleNavigate(p)}
                      className="func-card text-sm text-slate-600 hover:text-slate-800 flex items-center gap-3">
                      <ChevronRight className="h-4 w-4 text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {stats.map((stat: any) => {
            const Icon = iconMap[stat.icon] || Activity;
            return (
              <div key={stat.label} className="glass-card p-5 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <p className="text-xl font-extrabold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
