'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Zap, Upload, ArrowRight, Scissors, Expand, Shirt, Camera,
  Wand2, ZoomIn, Palette, Layers, ShoppingBag, Video, Play, ChevronRight,
  MessageSquare, Cpu, Activity, Shield, Globe, Brain, Image as ImageIcon, Star
} from 'lucide-react';

const iconMap: Record<string, any> = {
  ShoppingBag, Scissors, Expand, Shirt, Camera, Wand2, ZoomIn, Layers, Palette, Video, Activity, Globe, Shield
};

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => { try { const r = await window.fetch('/api/cms/config'); setConfig(await r.json()); } catch {} })();
  }, []);

  if (!config) return (
    <div className="flex justify-center py-40 min-h-screen bg-[#0b1120]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
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
    <div className="flex flex-col items-center bg-[#0b1120] overflow-hidden">
      {/* ===== Hero - Dark Tech ===== */}
      <section className="relative w-full flex flex-col items-center px-4 pt-24 pb-20 overflow-hidden bg-hero-dark bg-hero-glow">
        {/* Grid */}
        <div className="absolute inset-0 bg-tech-grid opacity-[0.06]" />
        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 50px)' }} />
        
        {/* Particles - simulated with radial gradients */}
        <div className="absolute top-1/4 left-[15%] w-1 h-1 rounded-full bg-blue-400/40 blur-[1px] animate-pulse" style={{animationDelay:'0s'}} />
        <div className="absolute top-1/3 right-[20%] w-1.5 h-1.5 rounded-full bg-purple-400/30 blur-[1px] animate-pulse" style={{animationDelay:'1.5s'}} />
        <div className="absolute top-1/2 left-[30%] w-1 h-1 rounded-full bg-cyan-400/30 blur-[1px] animate-pulse" style={{animationDelay:'3s'}} />
        <div className="absolute bottom-1/3 right-[25%] w-1 h-1 rounded-full bg-blue-300/20 blur-[1px] animate-pulse" style={{animationDelay:'0.8s'}} />
        <div className="absolute top-[60%] left-[10%] w-0.5 h-0.5 rounded-full bg-white/20 blur-[1px] animate-pulse" style={{animationDelay:'2s'}} />

        <div className="relative z-10 flex flex-col lg:flex-row items-center max-w-6xl mx-auto gap-12 w-full">
          {/* Left: Hero content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">椒图AI v2.0 · AI修图引擎</span>
              <Badge className="bg-blue-500/20 text-blue-300 border-0 text-[10px]">LIVE</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1] max-w-xl">
              <span className="text-white">修图，就用</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">椒图AI</span>
            </h1>
            <p className="text-base text-slate-400 mb-2">让每个人都能轻松创作出专业级图片和视频</p>
            <p className="text-sm text-slate-500 mb-8 max-w-md">搭载自研视觉大模型，中文指令一键修图。电商设计、虚拟试衣、照片修复、AI视频，零基础上手</p>

            {/* Glowing input */}
            <div className="w-full max-w-xl">
              <div className="relative flex items-start bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 input-glow">
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  placeholder="> 描述你想要的效果，或上传图片开始创作..."
                  className="flex-1 resize-none bg-transparent border-0 text-white/90 placeholder:text-slate-500 focus-visible:ring-0 py-4 px-5 pr-28 text-base min-h-[60px] max-h-[100px]"
                  rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNavigate(); } }} />
                <div className="flex items-center gap-1.5 py-3 pr-3">
                  <label className="cursor-pointer p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-all">
                    <Upload className="h-4 w-4" /><Input ref={fileInputRef} type="file" accept="image/*" className="hidden" /></label>
                  <Button onClick={() => handleNavigate()} size="icon"
                    className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20">
                    <ArrowRight className="h-5 w-5 text-white" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {quickPrompts.slice(0, 4).map((p: string) => (
                  <button key={p} onClick={() => handleNavigate(p)}
                    className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all">
                    {p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Case cards */}
          <div className="flex-1 w-full max-w-lg">
            <div className="grid grid-cols-2 gap-3">
              {[
                { before:'原图', after:'AI结果', tag:'电商套图', color:'from-blue-500/20 to-purple-500/20' },
                { before:'原图', after:'AI结果', tag:'背景替换', color:'from-emerald-500/20 to-teal-500/20' },
                { before:'原图', after:'AI结果', tag:'虚拟试衣', color:'from-orange-500/20 to-red-500/20' },
                { before:'原图', after:'AI结果', tag:'照片修复', color:'from-cyan-500/20 to-blue-500/20' },
              ].map((c, i) => (
                <div key={i} className="case-card cursor-pointer" onClick={() => router.push('/studio')}>
                  <div className={`aspect-[3/4] bg-gradient-to-br ${c.color} flex flex-col items-center justify-center gap-2 relative`}>
                    <span className="case-label before">{c.before}</span>
                    <span className="case-label after">{c.after}</span>
                    <ImageIcon className="h-8 w-8 text-white/20" />
                    <span className="text-[10px] text-white/40 font-medium">{c.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0b1120] to-transparent pointer-events-none" />
      </section>

      {/* ===== Tools ===== */}
      <section className="w-full max-w-6xl px-4 pt-16 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs text-slate-400">全能修图工具箱</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">AI 工具箱</h2>
          <p className="text-sm text-slate-500">覆盖所有修图场景，零基础上手</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tools.filter((t: any) => t.enabled !== false).map((tool: any) => {
            const Icon = iconMap[tool.icon] || Sparkles;
            return (
              <div key={tool.id} onClick={() => handleNavigate(tool.prompt)}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer text-center hover:border-blue-500/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                {tool.tag && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">{tool.tag}</Badge>
                )}
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-blue-400" /></div>
                <h3 className="text-sm font-semibold text-white mb-1">{tool.title}</h3>
                <p className="text-xs text-slate-500">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="w-full max-w-6xl px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat: any) => {
            const Icon = iconMap[stat.icon] || Activity;
            return (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all">
                <Icon className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full max-w-5xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white p-10 md:p-16 text-center shadow-2xl shadow-purple-500/20">
          <div className="absolute inset-0 bg-tech-grid opacity-10" />
          <div className="relative z-10">
            <Sparkles className="h-6 w-6 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">免费体验椒图AI</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-sm">无需下载，打开浏览器就能用</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/studio')}
                className="rounded-xl bg-white text-slate-800 hover:bg-white/90 border-0 h-12 px-8 font-bold shadow-lg">
                <Zap className="h-4 w-4 mr-2" />立即创作</Button>
              <Button onClick={() => router.push('/wallet')}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 h-12 px-8 font-semibold">
                查看套餐</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
