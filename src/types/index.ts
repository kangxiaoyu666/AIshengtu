export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: ImageAttachment[];
  timestamp: number;
}

export interface ImageAttachment {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  images: ImageAttachment[];
  createdAt: number;
  updatedAt: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  width: number;
  height: number;
}

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface WalletBalance {
  points: number;
  totalRecharged: number;
  totalSpent: number;
}

export interface Transaction {
  id: string;
  type: 'recharge' | 'consume' | 'refund';
  amount: number;
  balance: number;
  description: string;
  createdAt: number;
  status: 'success' | 'pending' | 'failed';
  method?: 'wechat' | 'alipay' | 'system';
}

export interface RechargePackage {
  id: string;
  points: number;
  price: number;
  label: string;
  popular?: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: 'image' | 'text' | 'video' | 'multimodal';
  endpoint: string;
  apiKey: string;
  modelName: string;
  status: 'active' | 'inactive';
  pointsPerUse: number;
  priority: number;
  createdAt: number;
}
