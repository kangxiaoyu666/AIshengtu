'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sparkles, Zap, Upload, ArrowRight, Scissors, Expand, Shirt, Camera,
  Wand2, ZoomIn, Palette, Layers, ShoppingBag, Video, Play,
  ChevronRight, MessageSquare, Cpu, Activity, Shield, Globe, Brain
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
    <div className="flex justify-center py-40 min-h-screen bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Brain className="h-5 w-5 text-white" /></div>
        <p className="text-sm text-slate-400">加载中...</p>
      </div>
    </div>
  );

  const { site, hero, tools, quickPrompts, stats } = config;

  const handleNavigate = (p?: string) => {
    const q = p || prompt.trim();
    router.push(q ? `/studio?prompt=${encodeURIComponent(q)}` : '/studio');
  };

  return (
    <div className="flex flex-col items-center bg-[#f8fafc] overflow-hidden">
      {/* ===== Hero ===== */}
      <section className="relative w-full flex flex-col items-center px-4 pt-28 pb-24 overflow-hidden">
        {/* 科技网格背景 */}
        <div className="absolute inset-0 bg-tech-grid opacity-25" />
        {/* 对角线装饰 */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 40px)' }} />

        {/* 柔和光晕 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto text-center">
          {/* 状态条 */}
          <div className="flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[13px] text-slate-500">{hero.badge}</span>
            <div className="w-px h-3 bg-slate-200" />
            <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px] font-medium">LIVE</Badge>
          </div>

          {/* 标题 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-3xl">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">{hero.heading}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-3 font-medium">{hero.subheading}</p>
          <p className="text-sm text-slate-400 mb-12 max-w-xl leading-relaxed">{hero.desc}</p>

          {/* 输入框 */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="relative w-full">
              <div className="relative flex items-start bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  placeholder={hero.inputPlaceholder}
                  className="flex-1 resize-none bg-transparent border-0 text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 py-5 px-5 pr-28 text-base min-h-[64px] max-h-[100px]"
                  rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNavigate(); } }} />
                <div className="flex items-center gap-1.5 py-3 pr-3">
                  <label className="cursor-pointer p-2.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all">
                    <Upload className="h-4 w-4" /><Input ref={fileInputRef} type="file" accept="image/*" className="hidden" /></label>
                  <Button onClick={() => handleNavigate()} size="icon"
                    className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md shadow-blue-500/20">
                    <ArrowRight className="h-5 w-5 text-white" /></Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {quickPrompts.slice(0, 6).map((p: string) => (
                <button key={p} onClick={() => handleNavigate(p)}
                  className="px-4 py-2 text-xs rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  {p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent pointer-events-none" />
      </section>

      {/* ===== 分割线 ===== */}
      <div className="w-full max-w-6xl px-4">
        <div className="data-line" />
      </div>

      {/* ===== 工具箱 ===== */}
      <section className="w-full max-w-6xl px-4 pt-16 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-blue-600 font-semibold">全能修图工具箱</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">AI 工具箱</h2>
          <p className="text-sm text-slate-500">覆盖所有修图场景，零基础上手，点击即用</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tools.filter((t: any) => t.enabled !== false).map((tool: any) => {
            const Icon = iconMap[tool.icon] || Sparkles;
            return (
              <div key={tool.id} onClick={() => handleNavigate(tool.prompt)}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer text-center hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {tool.tag && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                    {tool.tag}</Badge>
                )}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform border border-blue-100/50">
                  <Icon className="h-5 w-5 text-blue-500" /></div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{tool.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 数据统计 ===== */}
      <section className="w-full max-w-6xl px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat: any) => {
            const Icon = iconMap[stat.icon] || Activity;
            return (
              <Card key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3 mx-auto border border-blue-100/50">
                  <Icon className="h-6 w-6 text-blue-500" /></div>
                <p className="text-3xl font-extrabold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== 演示区 ===== */}
      <section className="w-full max-w-6xl px-4 pb-20">
        <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm group cursor-pointer"
          onClick={() => router.push('/studio')}>
          {/* 背景线条 */}
          <div className="absolute inset-0 bg-tech-grid opacity-15" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs">
                <Play className="h-3.5 w-3.5 mr-1.5" />演示视频</Badge>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3">
                30秒看懂<span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">椒图AI</span>
              </h3>
              <p className="text-sm text-slate-500 mb-6">从上传图片到生成结果，只需简单三步。让AI帮你完成专业级修图。</p>
              <Button onClick={() => router.push('/studio')}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 h-11 px-6 shadow-md shadow-blue-500/20 font-semibold">
                开始体验 <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-200">
                  <Play className="h-6 w-6 text-blue-500 ml-0.5" /></div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> 01:32</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ===== 热门提示词 ===== */}
      <section className="w-full max-w-6xl px-4 pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-slate-500 font-medium">热门提示词</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">创意灵感库</h2>
          <p className="text-sm text-slate-500">一键使用社区热门指令</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickPrompts.map((p: string, i: number) => (
            <div key={i} onClick={() => handleNavigate(p)}
              className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">{p}</p>
              </div>
              <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full max-w-5xl px-4 pb-24">
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-10 md:p-16 text-center shadow-xl">
          {/* 背景线条 */}
          <div className="absolute inset-0 bg-tech-grid opacity-10" />
          {/* 对角线 */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(-30deg, white 0px, white 1px, transparent 1px, transparent 50px)' }} />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-blue-200" />
              <span className="text-sm text-blue-100">开始你的创作之旅</span>
              <Sparkles className="h-5 w-5 text-blue-200" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">免费体验椒图AI</h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto text-sm">无需下载，打开浏览器就能用。AI修图、视频生成，一键搞定。</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/studio')}
                className="rounded-xl bg-white text-blue-600 hover:bg-blue-50 border-0 h-12 px-8 font-bold shadow-lg">
                <Zap className="h-4 w-4 mr-2" />立即创作</Button>
              <Button onClick={() => router.push('/wallet')}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 h-12 px-8 font-semibold">
                查看套餐</Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
