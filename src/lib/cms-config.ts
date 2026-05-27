/**
 * CMS 配置系统
 * 后台修改，前台实时生效
 */
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = '/tmp/jiaotu_data/cms_config.json';

const defaultConfig = {
  // 站点信息
  site: {
    name: '造境 AI',
    slogan: '中文AI修图神器',
    description: '免费在线AI修图工具，中文指令一键修图。支持电商设计、虚拟试衣、照片修复、背景处理、抠图扩图、高清放大、AI视频生成。',
    keywords: '造境 AI,AI修图,电商套图,AI抠图,AI扩图,虚拟试衣,证件照制作,照片修复,AI视频',
    logo: '造境 AI',
    footer: '© 2025 造境 AI · All Rights Reserved.',
  },

  // 首页 Hero
  hero: {
    badge: '造境 AI v2.0 · 全功能在线',
    heading: '修图，就用造境 AI',
    subheading: '让每个人都能轻松创作出专业级图片和视频',
    desc: '搭载自研视觉大模型，中文指令一键修图。电商设计、虚拟试衣、照片修复、AI视频，零基础上手',
    inputPlaceholder: '> 描述你想要的效果，或上传图片开始创作...',
  },

  // 首页工具卡片
  tools: [
    { id:1, icon:'ShoppingBag', title:'电商套图', desc:'上传商品图，一键生成套图方案', tag:'HOT', prompt:'请帮我生成这套产品的电商套图', enabled:true },
    { id:2, icon:'Scissors', title:'AI 抠图', desc:'智能识别主体，精准去除背景', prompt:'请把这张图片的背景抠掉', enabled:true },
    { id:3, icon:'Expand', title:'AI 扩图', desc:'智能扩展边界，无缝填充画面', prompt:'请把这张图片向四周扩展', enabled:true },
    { id:4, icon:'Shirt', title:'虚拟试衣', desc:'上传服装，AI帮你虚拟换装', prompt:'请给人物换上这件衣服', enabled:true },
    { id:5, icon:'Camera', title:'证件照', desc:'一键换底换装，专业证件照', prompt:'请帮我制作证件照', enabled:true },
    { id:6, icon:'Wand2', title:'照片修复', desc:'老照片翻新、去噪、上色', prompt:'请修复这张老照片', enabled:true },
    { id:7, icon:'ZoomIn', title:'高清放大', desc:'无损放大最高4x', prompt:'请将图片高清放大2倍', enabled:true },
    { id:8, icon:'Layers', title:'海报设计', desc:'一句话生成精美海报', prompt:'请帮我设计一张宣传海报', enabled:true },
    { id:9, icon:'Palette', title:'风格迁移', desc:'秒变动漫、油画风格', prompt:'请把图片转为动漫风格', enabled:true },
    { id:10, icon:'Video', title:'AI 视频', desc:'文字/图片生成视频', tag:'NEW', prompt:'请帮我生成一段视频', enabled:true },
  ],

  // 首页快速提示词
  quickPrompts: [
    '把照片背景替换成海边日落',
    '给人物换一个时尚短发发型',
    '去除图片中所有水印文字',
    '把照片上的路人全部消除',
    '生成这张图片十年后的样子',
    '帮我把果汁替换成冰咖啡',
    '让照片里的人物开心地笑起来',
    '帮我设计一张秋季促销海报',
  ],

  // 统计卡片
  stats: [
    { label: '日均处理', value: '50万+', icon: 'Activity' },
    { label: '覆盖场景', value: '20+', icon: 'Globe' },
    { label: '安全加密', value: '银行级', icon: 'Shield' },
  ],

  // 充值套餐
  rechargePackages: [
    { id:'pkg1', points:100, price:9.9, label:'100点' },
    { id:'pkg2', points:500, price:39.9, label:'500点', popular:true },
    { id:'pkg3', points:1200, price:79.9, label:'1200点' },
    { id:'pkg4', points:3000, price:169.9, label:'3000点' },
    { id:'pkg5', points:8000, price:399.9, label:'8000点' },
    { id:'pkg6', points:20000, price:899.9, label:'20000点' },
  ],

  // 创建工坊快捷工具
  studioTools: [
    { label:'电商套图', icon:'ShoppingBag', prompt:'请帮我生成这套产品的电商套图', color:'text-blue-500' },
    { label:'抠图', icon:'Scissors', prompt:'请把这张图片的背景抠掉，保留主体', color:'text-cyan-500' },
    { label:'扩图', icon:'Expand', prompt:'请把这张图片向四周扩展，智能填充', color:'text-indigo-500' },
    { label:'换装', icon:'Shirt', prompt:'请给图片中的人物换上这件衣服', color:'text-purple-500' },
    { label:'证件照', icon:'Camera', prompt:'请帮我制作证件照', color:'text-pink-500' },
    { label:'修复', icon:'Wand2', prompt:'请修复这张老照片，去除噪点和划痕', color:'text-amber-500' },
    { label:'放大', icon:'ZoomIn', prompt:'请将这张图片高清放大2倍', color:'text-emerald-500' },
    { label:'海报', icon:'Layers', prompt:'请帮我设计一张宣传海报', color:'text-rose-500' },
  ],
};

export type CMSConfig = typeof defaultConfig;

export function getConfig(): CMSConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(data) };
    }
  } catch {}
  return defaultConfig;
}

export function saveConfig(config: Partial<CMSConfig>): CMSConfig {
  const current = getConfig();
  const merged = deepMerge(current, config);
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

export function resetConfig(): CMSConfig {
  if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
  return defaultConfig;
}

function deepMerge(a: any, b: any): any {
  if (Array.isArray(b)) return b;
  const result = { ...a };
  for (const key of Object.keys(b)) {
    if (b[key] && typeof b[key] === 'object' && !Array.isArray(b[key])) {
      result[key] = deepMerge(a[key] || {}, b[key]);
    } else {
      result[key] = b[key];
    }
  }
  return result;
}
