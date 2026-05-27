'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Sparkles, Upload, Download, Copy, X, Image, ShoppingBag,
  Scissors, Expand, Shirt, Camera, Wand2, Layers, MessageSquare,
  PenTool, User, Plus, ChevronDown, Cpu,
} from 'lucide-react';
import { getWallet } from '@/lib/wallet';

/* ================================================================
   Data
   ================================================================ */

const creativeTypes = [
  { id: 'text2img', label: 'AI 文生图', icon: Image, active: true },
  { id: 'img2img', label: '图生图', icon: Image },
  { id: 'chat-edit', label: '对话修图', icon: MessageSquare },
  { id: 'product', label: '商品图', icon: ShoppingBag },
  { id: 'poster', label: 'AI 海报', icon: Layers },
];

const imageTools = [
  { id: 'remove-bg', label: '一键抠图', icon: Scissors },
  { id: 'expand', label: 'AI 扩图', icon: Expand },
  { id: 'restore', label: '高清修复', icon: Wand2 },
  { id: 'change-bg', label: '换背景', icon: Shirt },
  { id: 'id-photo', label: '证件照', icon: Camera },
];

const modelOptions = [
  { id: 'default', label: '默认模型', desc: '通用高质量生成' },
  { id: 'realistic', label: '写实模型', desc: '照片级真实感' },
  { id: 'illustration', label: '插画模型', desc: '艺术插画风格' },
  { id: 'product', label: '商品图模型', desc: '电商产品优化' },
];

const aspectRatios = [
  { id: '1:1', label: '1:1', w: 1024, h: 1024 },
  { id: '3:4', label: '3:4', w: 768, h: 1024 },
  { id: '4:3', label: '4:3', w: 1024, h: 768 },
  { id: '9:16', label: '9:16', w: 576, h: 1024 },
  { id: '16:9', label: '16:9', w: 1024, h: 576 },
];

const sizeOptions = ['1024x1024', '768x1024', '1024x768'];

const styleOptions = ['写实摄影', '商业摄影', '插画', '动漫', '3D', '科技感'];

const quickPrompts = [
  { icon: '🌆', label: '未来城市海报', prompt: '未来城市海报，赛博朋克风格，霓虹灯光，高科技感' },
  { icon: '🛍️', label: '高级感商品主图', prompt: '高级感商品主图，极简白色背景，专业产品摄影，柔和灯光' },
  { icon: '💜', label: '蓝紫科技背景', prompt: '蓝紫科技背景，抽象几何，数据流，未来科技感' },
  { icon: '📱', label: '小红书封面', prompt: '小红书封面图，清新自然风格，温暖色调，生活美学' },
  { icon: '👤', label: '写实人像', prompt: '写实人像摄影，自然光，浅景深，专业肖像' },
];

/* ================================================================
   Component
   ================================================================ */

export default function StudioContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  // --- prompt & generation state ---
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('default');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imgSize, setImgSize] = useState('1024x1024');
  const [imgCount, setImgCount] = useState(2);
  const [style, setStyle] = useState('写实摄影');
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => { setPoints(getWallet().points); }, []);
  useEffect(() => {
    if (initialPrompt && !hasGenerated) setPrompt(initialPrompt);
  }, [initialPrompt, hasGenerated]);

  // sync image size when aspect ratio changes
  const handleAspectChange = (ratio: string) => {
    setAspectRatio(ratio);
    const found = aspectRatios.find((r) => r.id === ratio);
    if (found && found.w && found.h) {
      setImgSize(`${found.w}x${found.h}`);
    }
  };

  // --- points calc ---
  const pointsPerImage = 2;
  const totalCost = pointsPerImage * imgCount;

  // --- mock generate ---
  const mockGenerate = useCallback(() => {
    const palette = ['6366f1', '8b5cf6', '3b82f6', '06b6d4', '10b981', 'f59e0b', 'ef4444', 'ec4899'];
    return Array.from({ length: imgCount }, (_, i) =>
      `https://placehold.co/${imgSize.replace('x', 'x')}/${palette[i % palette.length]}/ffffff?text=AI+Result+${i + 1}`
    );
  }, [imgCount, imgSize]);

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text) {
      toast.error('请输入提示词');
      return;
    }
    if (loading) return;
    if (points < totalCost) {
      toast.error('点数不足', {
        description: `需要 ${totalCost} 点，当前余额 ${points} 点`,
        action: { label: '去充值', onClick: () => (window.location.href = '/wallet') },
      });
      return;
    }
    setLoading(true);
    setResultImages([]);

    try {
      // TODO: call /api/ai/generate-image with params
      await new Promise((r) => setTimeout(r, 1500));
      const results = mockGenerate();
      setResultImages(results);
      setHasGenerated(true);
      setPoints((prev) => prev - totalCost);
      toast.success('生成完成', { description: `消耗 ${totalCost} 点，剩余 ${points - totalCost} 点` });
    } catch {
      toast.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [prompt, loading, points, totalCost, mockGenerate]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success('已复制链接'));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#f4f7ff] text-slate-800">
      {/* ================================================================
          LEFT SIDEBAR
          ================================================================ */}
      <aside className="w-56 shrink-0 bg-white/70 backdrop-blur border-r border-slate-200/60 flex flex-col overflow-hidden">
        {/* New Task */}
        <div className="p-3">
          <Button
            onClick={() => {
              setPrompt('');
              setResultImages([]);
              setHasGenerated(false);
              setNegativePrompt('');
            }}
            className="w-full rounded-xl h-10 text-sm font-semibold btn-brand gap-2"
          >
            <Plus className="h-4 w-4" /> 新任务
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {/* Group 1: 创作类型 */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">创作类型</p>
            <div className="space-y-0.5">
              {creativeTypes.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    item.active
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: 图片工具 */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">图片工具</p>
            <div className="space-y-0.5">
              {imageTools.map((item) => (
                <button
                  key={item.id}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Points at bottom of sidebar */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-amber-50/80">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">可用点数</p>
              <p className="text-sm font-bold text-slate-700">{points.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================
          CENTER — Main workspace
          ================================================================ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100">
          <h1 className="text-xl font-extrabold text-slate-800">AI 文生图</h1>
          <p className="text-sm text-slate-400 mt-1">
            用一句话描述你想生成的画面，造境 AI 会为你生成图片
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
            {/* ===== Prompt Input ===== */}
            <div className="hero-input overflow-hidden">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="一句话描述你的创意视觉，例如：一只猫咪在星空下弹吉他..."
                className="w-full resize-none bg-transparent border-0 text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 py-5 px-6 text-base min-h-[72px]"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                    <Upload className="h-3.5 w-3.5" /> 上传图片
                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                  </label>
                  <span className="text-[10px] text-slate-300">⌘+Enter 生成</span>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  className="rounded-xl btn-brand h-9 px-5 text-sm gap-1.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> 立即生成
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* ===== Quick Prompts ===== */}
            {!hasGenerated && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-3">快速开始</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => setPrompt(qp.prompt)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm transition-all"
                    >
                      <span>{qp.icon}</span>
                      <span>{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ===== Example Prompt Cards (empty state) ===== */}
            {!hasGenerated && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-3">提示词示例</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: '🏙️ 城市风光', text: '未来城市天际线，日落时分，金色与紫色天空，玻璃建筑反射光线，4K超写实，电影级光影' },
                    { title: '🎨 艺术插画', text: '梦幻森林中的小鹿，柔和的晨光穿过树叶，宫崎骏动画风格，温暖治愈的色彩' },
                    { title: '📦 电商产品', text: '白色陶瓷咖啡杯，极简风格，柔和自然光，浅景深，干净白色背景，产品摄影' },
                    { title: '🌟 抽象科技', text: '流动的光粒子构成数字大脑，蓝紫渐变，深邃太空背景，未来科技感，高清渲染' },
                  ].map((ex, i) => (
                    <div
                      key={i}
                      onClick={() => setPrompt(ex.text)}
                      className="group bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-xs font-semibold text-slate-700 mb-1.5">{ex.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-600 line-clamp-2">
                        {ex.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== Result Grid ===== */}
            {hasGenerated && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-slate-700">生成结果</p>
                  <span className="text-xs text-slate-400">消耗 {totalCost} 点</span>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: imgCount }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-slate-100 flex items-center justify-center animate-pulse"
                      >
                        <Sparkles className="h-8 w-8 text-blue-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`grid gap-4 ${
                      imgCount <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'
                    }`}
                  >
                    {resultImages.map((url, i) => (
                      <div
                        key={i}
                        className="group relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all"
                      >
                        <img
                          src={url}
                          alt={`Result ${i + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(url)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================================================================
          RIGHT PANEL — 生成设置
          ================================================================ */}
      <aside className="w-72 shrink-0 bg-white/70 backdrop-blur border-l border-slate-200/60 overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800">生成设置</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">调整参数获得最佳效果</p>
        </div>

        <div className="p-4 space-y-5">
          {/* 1. 模型选择 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">模型选择</label>
            <div className="mt-2 space-y-1.5">
              {modelOptions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedModel === m.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-700 font-semibold'
                      : 'bg-white border border-slate-100 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <div>{m.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 图片比例 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">图片比例</label>
            <div className="flex gap-1.5 mt-2">
              {aspectRatios.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleAspectChange(r.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    aspectRatio === r.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 图片尺寸 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">图片尺寸</label>
            <div className="flex gap-1.5 mt-2">
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setImgSize(s)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    imgSize === s
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 4. 生成数量 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">生成数量</label>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setImgCount(n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    imgCount === n
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {n}张
                </button>
              ))}
            </div>
          </div>

          {/* 5. 风格 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">风格</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {styleOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    style === s
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 6. 提示词增强 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">提示词增强</label>
              <p className="text-[10px] text-slate-400">自动优化提示词质量</p>
            </div>
            <Switch checked={enhancePrompt} onCheckedChange={setEnhancePrompt} />
          </div>

          {/* 7. 负面提示词 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">负面提示词</label>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="模糊、低质量、变形、多余的手指..."
              className="w-full resize-none rounded-xl bg-white border border-slate-200 text-slate-600 placeholder:text-slate-300 text-xs mt-2 h-16 p-3 focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          {/* 8. 点数消耗预估 */}
          <div className="bg-amber-50/60 rounded-xl p-3 space-y-1.5 border border-amber-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">单张消耗</span>
              <span className="text-slate-700 font-semibold">{pointsPerImage} 点</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">本次合计</span>
              <span className="text-slate-800 font-bold">{totalCost} 点</span>
            </div>
            <div className="flex justify-between text-xs border-t border-amber-200 pt-1.5">
              <span className="text-slate-500">当前余额</span>
              <span className={`font-bold ${points < totalCost ? 'text-red-500' : 'text-slate-800'}`}>
                {points.toLocaleString()} 点
              </span>
            </div>
          </div>

          {/* 9. 立即生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full rounded-xl btn-brand h-10 text-sm font-semibold gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 立即生成
              </>
            )}
          </Button>
        </div>
      </aside>
    </div>
  );
}
