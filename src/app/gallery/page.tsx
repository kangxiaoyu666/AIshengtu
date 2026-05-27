'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Download, Eye, Sparkles, X, Cpu, Grid3X3, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { GalleryItem } from '@/types';

const categories = ['全部', '电商设计', '人像修图', '风景创作', '海报设计', '虚拟试衣', '创意合成'];
const demos: GalleryItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: `demo-${i}`, url: `/assets/demo${(i % 6) + 1}.jpg`,
  prompt: ['把背景换成海滩日落','给模特穿上红色连衣裙','扩图为16:9风景比例','高清放大2倍修复细节','去除背景变成透明PNG','生成电商产品白底主图','制作蓝色渐变背景证件照','修复老照片去噪上色','生成科技感宣传海报','AI换背景为城市夜景','虚拟试衣时尚西装','智能扩图补全缺失画面','把果汁替换成冰咖啡','给人物换个时尚短发','生成赛博朋克风格街景','帮模特换个优美姿势','设计秋季促销活动海报','从鸟瞰视角重新构图'][i],
  createdAt: Date.now() - i * 7200000, width: 800, height: 600,
}));

export default function GalleryPage() {
  const [activeCat, setActiveCat] = useState('全部');
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  const handleDownload = (item: GalleryItem) => { toast.success('开始下载: ' + item.prompt); };

  return (
    <div className="flex flex-col items-center min-h-full bg-[#f5f7fa] relative">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
      <div className="relative z-10 w-full max-w-6xl px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="glow-dot" />
            <Badge className="px-3 py-1.5 bg-blue-50 text-blue-600 border-blue-200 rounded-full text-xs">
              <Sparkles className="h-3 w-3 mr-1.5" /> 灵感广场
            </Badge>
            <div className="glow-dot" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">社区创作作品</h1>
          <p className="text-slate-500 text-sm">探索精彩作品，获取创作灵感</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCat === cat
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
              }`}>{cat}</button>
          ))}
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {demos.map((item) => (
            <div key={item.id} onClick={() => setPreviewImage(item)}
              className="group break-inside-avoid rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="relative overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <p className="text-xs text-white/90 truncate max-w-[70%]">{item.prompt}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-600 line-clamp-2 mb-2">{item.prompt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); setPreviewImage(item); }}
                    className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 font-medium">
                    <Eye className="h-3 w-3" />预览
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}>
          <Card className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" /></button>
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-slate-300" />
            </div>
            <div className="p-6">
              <p className="text-slate-700 font-medium mb-2">{previewImage.prompt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{new Date(previewImage.createdAt).toLocaleDateString('zh-CN')}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(previewImage)}
                    className="rounded-xl text-xs"><Download className="h-3.5 w-3.5 mr-1" />下载</Button>
                  <Button size="sm" onClick={() => { toast.success('已复制提示词'); }}
                    className="rounded-xl text-xs bg-blue-500 hover:bg-blue-600 border-0">复制提示词</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
