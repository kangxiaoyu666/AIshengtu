'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Zap, Upload, ArrowRight, Scissors, Expand, Shirt,
  Wand2, Layers, ShoppingBag, ChevronRight, Brain, Star,
  MessageSquare, Image, PenTool, Grid3X3,
} from 'lucide-react';

const coreCapabilities = [
  { icon: Image, title: 'AI 文生图', desc: '输入文字描述，一键生成高质量图片', gradient: 'from-blue-400 to-blue-600' },
  { icon: MessageSquare, title: 'AI 对话修图', desc: '用自然语言描述修改需求，AI 理解并执行', gradient: 'from-purple-400 to-purple-600' },
  { icon: ShoppingBag, title: 'AI 商品图', desc: '上传产品图，自动生成电商套图方案', gradient: 'from-cyan-400 to-cyan-600' },
  { icon: Layers, title: 'AI 海报设计', desc: '一句话生成精美宣传海报与视觉设计', gradient: 'from-pink-400 to-pink-600' },
];

const imageTools = [
  { icon: Scissors, title: '一键抠图', desc: '智能识别主体，精准去除背景', color: 'from-emerald-400 to-teal-500' },
  { icon: Expand, title: 'AI 扩图', desc: '智能扩展边界，无缝填充画面', color: 'from-blue-400 to-indigo-500' },
  { icon: Wand2, title: '高清修复', desc: '老照片翻新、去噪、上色、增强', color: 'from-amber-400 to-orange-500' },
  { icon: Shirt, title: '换背景', desc: '一键更换图片背景，风格随心变', color: 'from-purple-400 to-pink-500' },
  { icon: PenTool, title: '无痕改字', desc: '图片中的文字智能替换，自然无痕', color: 'from-rose-400 to-red-500' },
  { icon: Grid3X3, title: '批量生成', desc: '一次生成多张变体，高效对比选优', color: 'from-cyan-400 to-blue-500' },
];

const hotTasks = [
  '把照片背景替换成海边日落',
  '去除图片中的水印文字',
  '生成一张电商商品主图',
  '把模糊照片变清晰',
  '生成一张小红书封面',
];

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNavigate = (p?: string) => {
    const q = p || prompt.trim();
    router.push(q ? `/studio?prompt=${encodeURIComponent(q)}` : '/studio');
  };

  return (
    <div className="flex flex-col items-center bg-page overflow-hidden">
      {/* ===== Background decorations ===== */}
      <div className="fixed inset-0 bg-grid-light pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-400/[0.06] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-t from-purple-400/[0.05] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 left-0 w-[400px] h-[300px] bg-gradient-to-r from-cyan-400/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ===== Main Container ===== */}
      <div className="relative z-10 w-full max-w-[1320px] mx-auto px-4 py-8">
        <div className="glass-stage overflow-hidden">

          {/* ===== Hero Section ===== */}
          <section className="relative px-8 md:px-14 pt-14 pb-10">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Left: Text + Input */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs text-slate-500 font-semibold">造境 AI V1.0</span>
                  <Badge className="bg-blue-500 text-white border-0 text-[10px]">NEW</Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-[1.15]">
                  <span className="gradient-text-brand">一句话，生成你的理想画面</span>
                </h1>
                <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                  支持 AI 生图、AI 修图、电商作图、海报设计、扩图、抠图与高清修复
                </p>

                {/* Hero Input */}
                <div className="w-full max-w-xl">
                  <div className="hero-input flex items-start">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="一句话描述你的创意视觉..."
                      className="flex-1 resize-none bg-transparent border-0 text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 py-5 px-5 pr-28 text-base min-h-[60px]"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNavigate(); }
                      }}
                    />
                    <div className="flex items-center gap-1.5 py-3 pr-3">
                      <label className="cursor-pointer p-2.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all">
                        <Upload className="h-4 w-4" />
                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                      </label>
                      <Button onClick={() => handleNavigate()} size="icon" className="h-10 w-10 rounded-xl btn-brand">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['商品主图', 'AI 修图', '去背景', '扩图', '证件照', '海报设计'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleNavigate(tag)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: 3D AI Illustration */}
              <div className="flex-1 flex justify-center">
                <div className="ai-illustration">
                  <div className="ai-core">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <div className="ai-ring ai-ring-1" />
                  <div className="ai-ring ai-ring-2" />
                  <div className="ai-ring ai-ring-3" />
                  <div className="ai-orb" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
                  <div className="ai-orb" style={{ top: '75%', right: '10%', animationDelay: '1s', background: '#7b61ff' }} />
                  <div className="ai-orb" style={{ bottom: '15%', left: '10%', animationDelay: '2s', background: '#45c7ff' }} />
                </div>
              </div>
            </div>
          </section>

          <div className="soft-divider mx-14" />

          {/* ===== Core Capabilities ===== */}
          <section className="px-8 md:px-14 py-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
              <h2 className="text-xl font-extrabold text-slate-800">核心能力</h2>
              <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px]">AI Powered</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreCapabilities.map((t) => (
                <div key={t.title} onClick={() => handleNavigate(t.title)} className="tool-card text-center group">
                  <div className={`tool-icon bg-gradient-to-br ${t.gradient} mx-auto shadow-md`}>
                    <t.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mt-3 mb-1">{t.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="soft-divider mx-14" />

          {/* ===== Image Tools ===== */}
          <section className="px-8 md:px-14 py-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-500" />
              <h2 className="text-xl font-extrabold text-slate-800">图片工具</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {imageTools.map((t) => (
                <div key={t.title} onClick={() => handleNavigate(t.title)} className="tool-card text-center group p-4">
                  <div
                    className={`tool-icon bg-gradient-to-br ${t.color} mx-auto shadow-md`}
                    style={{ width: 40, height: 40, borderRadius: 12 }}
                  >
                    <t.icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mt-2.5 mb-0.5">{t.title}</h3>
                  <p className="text-[10px] text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="soft-divider mx-14" />

          {/* ===== Hot Tasks ===== */}
          <section className="px-8 md:px-14 py-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              <h2 className="text-xl font-extrabold text-slate-800">热门创作任务</h2>
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {hotTasks.map((p, i) => (
                <div
                  key={i}
                  onClick={() => handleNavigate(p)}
                  className="group bg-white border border-slate-100 rounded-xl px-4 py-3.5 cursor-pointer hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <p className="text-sm text-slate-600 group-hover:text-slate-800 leading-relaxed">{p}</p>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </section>

          <div className="soft-divider mx-14" />

          {/* ===== CTA ===== */}
          <section className="px-8 md:px-14 py-10">
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 rounded-3xl p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8 border border-blue-100/50">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-blue-600 font-semibold">开始你的创作之旅</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">免费体验造境 AI</h3>
                <p className="text-sm text-slate-500 mb-5">无需下载，打开浏览器就能用。AI 创作，一键搞定。</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button onClick={() => router.push('/studio')} className="rounded-xl btn-brand h-11 px-7">
                    <Zap className="h-4 w-4 mr-2" />立即创作
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/wallet')}
                    className="rounded-xl h-11 px-7 border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                  >
                    查看套餐
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                {[
                  { value: '50万+', label: '日均处理' },
                  { value: '20+', label: '覆盖场景' },
                  { value: '银行级', label: '安全加密' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold gradient-text-brand">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
