'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Sparkles, Clock, Film, Cpu, Mountain, ChefHat, Building2, Gamepad2, Clapperboard, Loader2, ChevronRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

const demos = [
  { title: '雪山日出航拍', desc: '日出时分的雪山全景。从空中俯瞰连绵起伏的雪山山脉，山谷笼罩着晨雾...', icon: Mountain, bg: 'from-cyan-50 to-blue-50', iconColor: 'text-cyan-500' },
  { title: '美食主播烹饪', desc: '年轻女孩在明亮厨房，对着镜头微笑做糖醋鱼。镜头切换食物特写...', icon: ChefHat, bg: 'from-red-50 to-rose-50', iconColor: 'text-red-500' },
  { title: '都市夜景延时', desc: '高楼林立的城市天际线被夕阳染成金红色，霓虹灯逐渐亮起...', icon: Building2, bg: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-500' },
  { title: '空战第一视角', desc: '电影级空中战斗场景。飞行员第一视角高速空战...', icon: Gamepad2, bg: 'from-slate-50 to-gray-50', iconColor: 'text-slate-500' },
  { title: '戏剧独白表演', desc: '舞台聚光灯下青年男子，身穿旧式戏服，神情激动地质问命运...', icon: Clapperboard, bg: 'from-purple-50 to-violet-50', iconColor: 'text-purple-500' },
  { title: '海边日落漫步', desc: '金色沙滩上情侣漫步。夕阳染红海面，海浪轻拍，镜头缓缓跟随...', icon: Mountain, bg: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500' },
];

export default function VideoPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('请输入视频描述'); return; }
    setLoading(true);
    toast.success('视频生成请求已提交', { description: '预计1-3分钟完成' });
    setTimeout(() => { setLoading(false); toast.success('视频生成完成！'); }, 3000);
  };

  return (
    <div className="flex flex-col items-center min-h-full bg-[#f5f7fa]">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
      <div className="relative z-10 w-full max-w-5xl px-4 pt-12 pb-8 text-center">
        <Badge className="mb-4 px-3 py-1.5 bg-red-50 border-red-200 rounded-full">
          <Film className="h-3.5 w-3.5 mr-1.5 text-red-500" />
          <span className="text-xs text-red-500 font-medium">AI 视频生成</span>
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          文字描述，即刻生成<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">电影级视频</span>
        </h1>
        <p className="text-slate-500 text-sm">输入场景描述，AI 自动生成高质量短视频</p>
      </div>

      <div className="relative z-10 w-full max-w-3xl px-4 mb-12">
        <Card className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="> 描述你想要生成的视频场景，越详细效果越好..."
            className="w-full resize-none bg-transparent border-0 text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 min-h-[100px] text-sm leading-relaxed" />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />预计生成时间：1-3 分钟
            </div>
            <Button onClick={handleGenerate} disabled={!prompt.trim() || loading}
              className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 px-6 h-10 font-medium shadow-md shadow-red-500/20">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 生成中...</> : <><Play className="h-4 w-4 mr-2" /> 生成视频</>}
            </Button>
          </div>
        </Card>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
            <Sparkles className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs text-red-500 font-medium">灵感库</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">精选示例</h2>
          <p className="text-sm text-slate-500">点击示例快速开始</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demos.map((d) => (
            <Card key={d.title}
              onClick={() => { setPrompt(d.desc); toast(`已填充: ${d.title}`); }}
              className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${d.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <d.icon className={`h-5 w-5 ${d.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{d.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{d.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                点击使用 <ChevronRight className="h-3 w-3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
