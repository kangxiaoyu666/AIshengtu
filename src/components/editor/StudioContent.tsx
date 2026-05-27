'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Sparkles, Send, Upload, Image as ImageIcon, Plus, Trash2, PanelLeftClose, PanelLeft,
  X, MessageSquare, Zap, Brain, ShoppingBag, Scissors, Expand, Shirt, Camera,
  Wand2, ZoomIn, Layers, Palette, Copy, Download, Clock, Cpu, RotateCcw, MoreHorizontal,
  CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { consumePoints, hasEnoughPoints, getWallet } from '@/lib/wallet';
import { availableModels } from '@/lib/config';
import type { ChatMessage, ImageAttachment, ConversationItem } from '@/types';

const toolsQuick = [
  { icon: ShoppingBag, label: '电商套图', prompt: '请帮我生成这套产品的电商套图：白底图+场景图+详情图', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Scissors, label: '抠图', prompt: '请把这张图片的背景抠掉，保留主体，输出透明背景', color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { icon: Expand, label: '扩图', prompt: '请把这张图片向四周扩展，智能填充空白区域', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { icon: Shirt, label: '换装', prompt: '请给图片中的人物换上这件衣服', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Camera, label: '证件照', prompt: '请帮我制作证件照，蓝色或白色背景', color: 'text-pink-500', bg: 'bg-pink-50' },
  { icon: Wand2, label: '修复', prompt: '请修复这张老照片，去除噪点和划痕，增强清晰度', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: ZoomIn, label: '放大', prompt: '请将这张图片高清放大 2 倍', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Layers, label: '海报', prompt: '请帮我设计一张宣传海报', color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function StudioContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [activeTool, setActiveTool] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { const s = localStorage.getItem('jiaotu_conversations'); if (s) setConversations(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
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

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text && images.length === 0) return;
    if (loading) return;
    const pointsCost = mode === 'deep' ? 5 : 2;
    if (!hasEnoughPoints(pointsCost)) {
      toast.error('点数不足', { description: `需要 ${pointsCost} 点，当前余额 ${getWallet().points} 点。请先充值。`, action: { label: '去充值', onClick: () => window.location.href = '/wallet' } });
      return;
    }
    setInputValue(''); setLoading(true); setActiveTool('');
    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: text || '请处理这张图片', images: [...images], timestamp: Date.now() };
    const newMessages = [...messages, userMsg]; setMessages(newMessages);
    const apiMessages = newMessages.map((m) => {
      if (m.role === 'user' && m.images && m.images.length > 0) {
        const content: any[] = []; if (m.content) content.push({ type: 'text', text: m.content });
        m.images.forEach((img) => content.push({ type: 'image_url', image_url: { url: img.url, detail: 'high' } }));
        return { role: m.role, content };
      }
      return { role: m.role, content: m.content };
    });
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: apiMessages, model: selectedModel, mode }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || '请求失败'); }
      const data = await res.json();
      const assistantMsg: ChatMessage = { id: uuidv4(), role: 'assistant', content: data.response, timestamp: Date.now() };
      setMessages([...newMessages, assistantMsg]); setImages([]); saveConversation([...newMessages, assistantMsg], []);
      consumePoints(pointsCost, 'AI修图: ' + (text || '图片处理').slice(0, 30)); toast.success('处理完成', { description: '已消耗 ' + pointsCost + ' 点' });
    } catch (error: any) { toast.error(error.message || '处理失败'); }
    finally { setLoading(false); }
  }, [inputValue, images, messages, loading, selectedModel, mode, saveConversation]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newImg: ImageAttachment = { id: uuidv4(), url: ev.target?.result as string, name: file.name };
        setImages((prev) => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => setImages((prev) => prev.filter((i) => i.id !== id));
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const copyMessage = (text: string) => { navigator.clipboard.writeText(text); toast.success('已复制'); };
  const newConversation = () => { setMessages([]); setImages([]); setInputValue(''); setActiveConvId(''); setActiveTool(''); };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#f5f7fa]">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <button onClick={newConversation} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium transition-all shadow-md shadow-blue-500/20">
            <Plus className="h-4 w-4" />新对话</button>
          <button onClick={() => setSidebarOpen(false)} className="ml-2 p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <PanelLeftClose className="h-4 w-4" /></button>
        </div>

        {/* Quick Tools */}
        <div className="p-3 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">快捷工具</p>
          <div className="grid grid-cols-4 gap-1.5">
            {toolsQuick.map((t) => (
              <button key={t.label} onClick={() => { setInputValue(t.prompt); setActiveTool(t.label); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] transition-all ${
                  activeTool === t.label ? `${t.bg} ${t.color} border border-blue-200 shadow-sm` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}>
                <t.icon className="h-4 w-4" /><span>{t.label}</span></button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {conversations.map((conv) => (
              <button key={conv.id} onClick={() => { setActiveConvId(conv.id); setMessages(conv.messages); setImages(conv.images || []); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all truncate ${
                  activeConvId === conv.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">暂无对话记录</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                <PanelLeft className="h-4 w-4" /></button>
            )}
            <div className="flex bg-slate-100 rounded-xl p-0.5">
              <button onClick={() => setMode('fast')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'fast' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}><Zap className="h-3.5 w-3.5" />快速</button>
              <button onClick={() => setMode('deep')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'deep' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}><Brain className="h-3.5 w-3.5" />深度</button>
            </div>
            <Select value={selectedModel} onValueChange={(v) => v && setSelectedModel(v)}>
              <SelectTrigger className="w-[180px] h-8 rounded-lg bg-white border-slate-200 text-slate-700 text-xs hover:border-blue-300">
                <SelectValue /></SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col"><span className="text-sm">{m.name}</span><span className="text-[10px] text-slate-400">{m.description}</span></div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setMessages([]); setImages([]); }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="清空">
              <Trash2 className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-500" /></div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">开始创作</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">上传图片，选择工具或输入指令，AI即刻处理</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {toolsQuick.slice(0, 4).map((t) => (
                    <button key={t.label} onClick={() => setInputValue(t.prompt)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-500 hover:text-blue-500 hover:border-blue-300 transition-all">
                      <t.icon className="h-3.5 w-3.5" />{t.label}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 mt-1">
                    <Cpu className="h-4 w-4 text-white" /></Avatar>
                )}
                <div className={`group max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-5 py-3.5 ${
                    msg.role === 'user'
                      ? 'bg-blue-50 text-slate-700 border border-blue-100'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                  }`}>
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {msg.images.map((img) => (
                          <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" /></div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex gap-1 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyMessage(msg.content)} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors" title="复制">
                        <Copy className="h-3 w-3" /></button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0 bg-slate-100 mt-1"><ImageIcon className="h-4 w-4 text-slate-400" /></Avatar>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 mt-1">
                  <Cpu className="h-4 w-4 text-white animate-pulse" /></Avatar>
                <div className="bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-slate-500">AI 正在处理中{mode === 'deep' ? '（深度思考）' : ''}...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white">
          {images.length > 0 && (
            <div className="flex gap-2 px-4 pt-3 flex-wrap max-w-3xl mx-auto">
              {images.map((img) => (
                <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(img.id)} className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-white border border-red-200 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="p-4">
            <div className="max-w-3xl mx-auto flex items-end gap-2">
              <label className="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all shrink-0">
                <Upload className="h-5 w-5 text-slate-400 hover:text-blue-500" />
                <Input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
              <div className="flex-1 relative">
                <Textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="> 描述你想对图片做的操作..."
                  className="w-full resize-none rounded-2xl bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-300 min-h-[44px] max-h-[120px] py-3 px-4 pr-12 text-sm" rows={1} />
                {inputValue && (
                  <button onClick={() => setInputValue('')} className="absolute right-2 top-2 p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="h-3.5 w-3.5" /></button>
                )}
              </div>
              <Button onClick={handleSend} disabled={(!inputValue.trim() && images.length === 0) || loading}
                size="icon" className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 border-0 shadow-md shadow-blue-500/20 shrink-0">
                <Send className="h-5 w-5 text-white" /></Button>
            </div>
            <div className="max-w-3xl mx-auto mt-2">
              <Badge className={mode === 'deep' ? 'bg-purple-50 text-purple-600 border-purple-200 text-[10px]' : 'bg-blue-50 text-blue-600 border-blue-200 text-[10px]'}>
                {mode === 'deep' ? <><Brain className="h-3 w-3 mr-1" />深度思考：出图效果更优，耗时较长</> : <><Zap className="h-3 w-3 mr-1" />快速模式：支持连续生成与多图并行</>}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
