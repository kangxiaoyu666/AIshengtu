'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Sparkles, Send, Upload, Image as ImageIcon, Plus, Trash2, PanelLeftClose, PanelLeft,
  X, MessageSquare, Zap, Brain, ShoppingBag, Scissors, Expand, Shirt, Camera,
  Wand2, ZoomIn, Layers, Copy, Download, Cpu, Loader2, SlidersHorizontal, History,
} from 'lucide-react';
import { consumePoints, hasEnoughPoints, getWallet } from '@/lib/wallet';
import { availableModels } from '@/lib/config';
import type { ChatMessage, ImageAttachment, ConversationItem } from '@/types';

const toolsQuick = [
  { icon: ShoppingBag, label: '电商套图', prompt: '生成电商产品套图：白底+场景+详情' },
  { icon: Scissors, label: '抠图', prompt: '抠掉背景，输出透明PNG' },
  { icon: Expand, label: '扩图', prompt: '向四周扩展，智能填充' },
  { icon: Shirt, label: '换装', prompt: '给人物换上这件衣服' },
  { icon: Camera, label: '证件照', prompt: '制作蓝底/白底证件照' },
  { icon: Wand2, label: '修复', prompt: '修复老照片，去噪增强清晰度' },
  { icon: ZoomIn, label: '放大', prompt: '高清放大2倍' },
  { icon: Layers, label: '海报', prompt: '设计一张宣传海报' },
];

export default function StudioContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [imgSize, setImgSize] = useState('1024x1024');
  const [imgCount, setImgCount] = useState(2);
  const [negativePrompt, setNegativePrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { const s = localStorage.getItem('jiaotu_conversations'); if (s) setConversations(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { if (initialPrompt && messages.length === 0) setInputValue(initialPrompt); }, [initialPrompt]);

  const saveConversation = useCallback((msgs: ChatMessage[], imgs: ImageAttachment[]) => {
    const convId = activeConvId || uuidv4();
    if (!activeConvId) setActiveConvId(convId);
    const existing = conversations.find((c) => c.id === convId);
    const title = msgs[0]?.content?.slice(0, 30) || '新对话';
    const updated: ConversationItem = { id: convId, title, messages: msgs, images: imgs, createdAt: existing?.createdAt || Date.now(), updatedAt: Date.now() };
    const newConvs = [updated, ...conversations.filter((c) => c.id !== convId)].slice(0, 50);
    setConversations(newConvs);
    localStorage.setItem('jiaotu_conversations', JSON.stringify(newConvs));
  }, [activeConvId, conversations]);

  const mockGenerate = () => {
    const colors = ['6366f1', '8b5cf6', '3b82f6', '06b6d4', '10b981', 'f59e0b', 'ef4444', 'ec4899'];
    return Array.from({ length: imgCount }, (_, i) =>
      `https://placehold.co/${imgSize.replace('x','x')}/${colors[i % colors.length]}/ffffff?text=AI+Result+${i+1}`
    );
  };

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text && images.length === 0) return;
    if (loading) return;
    const pointsCost = mode === 'deep' ? 5 : 2;
    if (!hasEnoughPoints(pointsCost)) {
      toast.error('点数不足', { description: `需要 ${pointsCost} 点，当前余额 ${getWallet().points} 点。`, action: { label: '去充值', onClick: () => window.location.href = '/wallet' } });
      return;
    }
    setInputValue(''); setLoading(true); setResultImages([]);

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: text || '请处理这张图片', images: [...images], timestamp: Date.now() };
    const newMessages = [...messages, userMsg]; setMessages(newMessages);

    // Simulate AI generation with delay
    setTimeout(() => {
      const results = mockGenerate();
      setResultImages(results);
      const assistantMsg: ChatMessage = {
        id: uuidv4(), role: 'assistant',
        content: `已为您生成 ${imgCount} 张图片\n尺寸: ${imgSize} | 模型: ${selectedModel} | 消耗 ${pointsCost} 点`,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, assistantMsg]);
      setImages([]);
      saveConversation([...newMessages, assistantMsg], []);
      consumePoints(pointsCost, 'AI修图: ' + (text || '图片处理').slice(0, 30));
      toast.success('生成完成', { description: `已消耗 ${pointsCost} 点` });
      setLoading(false);
    }, 2000);
  }, [inputValue, images, messages, loading, selectedModel, mode, imgCount, imgSize, saveConversation]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, { id: uuidv4(), url: ev.target?.result as string, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => setImages((prev) => prev.filter((i) => i.id !== id));
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const newConversation = () => { setMessages([]); setImages([]); setResultImages([]); setInputValue(''); setActiveConvId(''); };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0b1120]">
      {/* Left Sidebar - Tools + History */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#0f172a]/95 border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="p-3 border-b border-white/5">
          <button onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4" />新任务</button>
        </div>
        <div className="p-3 border-b border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">快捷工具</p>
          <div className="space-y-1">
            {toolsQuick.map((t) => (
              <button key={t.label} onClick={() => setInputValue(t.prompt)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <t.icon className="h-3.5 w-3.5" />{t.label}</button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-2">历史项目</p>
            {conversations.map((conv) => (
              <button key={conv.id} onClick={() => { setActiveConvId(conv.id); setMessages(conv.messages); setImages(conv.images || []); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate ${
                  activeConvId === conv.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'
                }`}>
                <div className="flex items-center gap-2">
                  <History className="h-3 w-3 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center - Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <PanelLeft className="h-4 w-4" /></button>
            )}
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button onClick={() => setMode('fast')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${mode==='fast'?'bg-blue-500/20 text-blue-400':'text-slate-500'}`}>
                <Zap className="h-3 w-3"/>快速</button>
              <button onClick={() => setMode('deep')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${mode==='deep'?'bg-purple-500/20 text-purple-400':'text-slate-500'}`}>
                <Brain className="h-3 w-3"/>深度</button>
            </div>
            <Select value={selectedModel} onValueChange={(v) => v && setSelectedModel(v)}>
              <SelectTrigger className="w-[150px] h-8 rounded-lg bg-white/5 border-white/10 text-slate-300 text-xs">
                <SelectValue /></SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setParamsOpen(!paramsOpen)} className={`p-2 rounded-lg transition-colors ${paramsOpen?'bg-white/10 text-blue-400':'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <SlidersHorizontal className="h-4 w-4"/></button>
            <button onClick={() => { setMessages([]); setResultImages([]); setImages([]); }} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5">
              <Trash2 className="h-4 w-4"/></button>
          </div>
        </div>

        {/* Canvas Area */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            {resultImages.length > 0 ? (
              /* Image Results Grid */
              <div className="result-grid mb-6">
                {resultImages.map((url, i) => (
                  <div key={i} className="relative group cursor-pointer" onClick={() => toast(`图片 ${i+1} 已保存`)}>
                    <img src={url} alt={`Result ${i+1}`} className="w-full rounded-xl border border-white/5" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white"><Download className="h-4 w-4"/></button>
                      <button className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white"><Copy className="h-4 w-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : loading ? (
              /* Generating skeleton */
              <div className="result-grid">
                {Array.from({ length: imgCount }, (_, i) => (
                  <div key={i} className="skeleton-img aspect-square flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-slate-600 animate-spin" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              /* Empty state */
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Sparkles className="h-10 w-10 text-blue-400" /></div>
                <h2 className="text-xl font-bold text-white mb-2">开始创作</h2>
                <p className="text-sm text-slate-500 max-w-sm mb-6">输入提示词或上传图片，AI即刻为你生成</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {toolsQuick.slice(0, 4).map((t) => (
                    <button key={t.label} onClick={() => setInputValue(t.prompt)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all">
                      <t.icon className="h-3.5 w-3.5" />{t.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat history */
              <div className="w-full max-w-2xl space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role==='user'?'justify-end':'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role==='user'?'bg-blue-500/10 text-slate-200 border border-blue-500/20':'bg-white/5 text-slate-300 border border-white/5'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Input */}
        <div className="border-t border-white/5 p-4 shrink-0">
          {images.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap max-w-3xl mx-auto">
              {images.map((img) => (
                <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/10 group">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(img.id)}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100"><X className="h-3 w-3"/></button>
                </div>
              ))}
            </div>
          )}
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <label className="cursor-pointer p-2.5 rounded-xl hover:bg-white/10 text-slate-500 hover:text-blue-400 transition-all shrink-0">
              <Upload className="h-5 w-5" /><Input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" /></label>
            <div className="flex-1 relative">
              <Textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="> 描述你想对图片做的操作..."
                className="w-full resize-none rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/30 min-h-[44px] max-h-[100px] py-3 px-4 pr-12 text-sm" rows={1} />
              {inputValue && (
                <button onClick={() => setInputValue('')} className="absolute right-2 top-2 p-1 rounded-md text-slate-500 hover:text-red-400">
                  <X className="h-3.5 w-3.5"/></button>
              )}
            </div>
            <Button onClick={handleSend} disabled={(!inputValue.trim() && images.length===0) || loading}
              size="icon" className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-30 border-0 shrink-0">
              <Send className="h-5 w-5 text-white"/></Button>
          </div>
        </div>
      </div>

      {/* Right - Parameters Panel */}
      <div className={`${paramsOpen ? 'w-64' : 'w-0'} bg-[#0f172a]/95 border-l border-white/5 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="p-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">参数设置</h3>
          <p className="text-[10px] text-slate-500">调整生成参数获得更好效果</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase">图片尺寸</label>
            <Select value={imgSize} onValueChange={(v) => v && setImgSize(v)}>
              <SelectTrigger className="h-8 rounded-lg bg-white/5 border-white/10 text-slate-300 text-xs mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="512x512">512 x 512</SelectItem>
                <SelectItem value="1024x1024">1024 x 1024</SelectItem>
                <SelectItem value="1024x768">1024 x 768</SelectItem>
                <SelectItem value="768x1024">768 x 1024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">生成数量</label>
            <div className="flex gap-1 mt-1">
              {[1,2,4].map(n => (
                <button key={n} onClick={() => setImgCount(n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${imgCount===n?'bg-blue-500/20 text-blue-400 border border-blue-500/30':'bg-white/5 text-slate-500 border border-white/5'}`}>
                  {n}张</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">负面提示词</label>
            <Textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="模糊、低质量、变形..."
              className="w-full resize-none rounded-lg bg-white/5 border-white/10 text-slate-300 placeholder:text-slate-600 text-xs mt-1 h-16 p-2" />
          </div>
          <div className="pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">预估消耗</span>
              <span className="text-blue-400 font-bold">{mode==='deep'?5:2} 点/张</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">本次合计</span>
              <span className="text-white font-bold">{(mode==='deep'?5:2)*imgCount} 点</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
