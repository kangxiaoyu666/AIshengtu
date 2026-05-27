# 造镜AI - 中文AI修图平台

在线AI图片创作工具，支持文生图、图生图、电商套图、虚拟试衣、照片修复、AI视频生成。前端Next.js + 后台管理系统 + 支付/点数体系。

## 技术栈

- **前端**: Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **后端**: Next.js API Routes (App Router)
- **数据**: JSON文件存储（可平滑迁移MySQL）
- **支付**: 微信支付 Native / 支付宝（适配器模式）
- **AI**: OpenAI兼容API / 多模型支持

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 首页
│   ├── studio/             # 创作工坊（AI修图）
│   ├── video/              # AI视频生成
│   ├── gallery/            # 灵感广场
│   ├── wallet/             # 点数钱包+充值
│   ├── login/register/     # 登录注册
│   ├── admin/              # 后台管理系统
│   │   ├── dashboard/      # 仪表盘
│   │   ├── users/          # 用户管理
│   │   ├── payments/       # 充值记录
│   │   ├── pointlogs/      # 点数流水
│   │   ├── tasks/          # AI任务管理
│   │   ├── models/         # 模型配置
│   │   ├── payment-channels/ # 支付渠道
│   │   ├── cms/            # CMS内容配置
│   │   └── settings/       # 系统设置
│   └── api/                # 后端API接口
├── components/             # 组件库
├── lib/                    # 核心库
│   ├── db.ts               # 数据存储层
│   ├── user-store.ts       # 用户管理
│   ├── wechatpay.ts        # 微信支付适配器
│   ├── alipay.ts           # 支付宝适配器
│   ├── cms-config.ts       # CMS配置
│   └── admin-auth.ts       # 管理员鉴权
└── types/                  # TypeScript类型
```

## 核心功能

### 前台用户端
- AI修图：文生图、图生图、局部重绘、背景替换
- AI视频：文字描述生成视频
- 作品库：保存、下载、社区分享
- 点数充值：微信支付/支付宝（Native扫码）

### 后台管理
- 用户管理：搜索/筛选/封禁/角色管理
- 充值订单：支付状态跟踪、补单处理
- 点数流水：不可篡改的交易日志
- AI任务：队列状态监控（排队/生成中/成功/失败）
- 模型配置：多平台API接入（OpenAI/Anthropic/Gemini/自定义）
- 支付渠道：微信/支付宝配置（密钥加密存储）
- CMS配置：首页内容/工具/套餐动态配置

### 安全特性
- 充值金额点数从服务端套餐表查询，不信任前端传参
- 点数操作有完整流水日志（冻结/扣除/返还）
- 支付回调签名验证 + 幂等处理
- 管理员API鉴权
- 敏感密钥加密存储、脱敏回显

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| WECHAT_MERCHANT_ID | 微信支付商户号 | 生产必填 |
| WECHAT_APP_ID | 微信应用ID | 生产必填 |
| WECHAT_API_V3_KEY | 微信API v3密钥 | 生产必填 |
| WECHAT_PRIVATE_KEY | 商户私钥PEM | 生产必填 |
| WECHAT_SERIAL_NO | 证书序列号 | 生产必填 |
| ADMIN_TOKEN | 管理员Token | 建议修改 |
| OPENAI_API_KEY | OpenAI API Key | 选填 |

## 生产部署

```bash
npm run build
npm start
```

建议部署到 Vercel（一键部署）或自己的服务器。

## 数据库迁移

当前使用 `/tmp/jiaotu_data/` 目录下的JSON文件存储。迁移到MySQL时：
1. 导出JSON数据
2. 创建对应的MySQL表（参考 `src/lib/db.ts` 中的接口定义）
3. 替换 `readTable/writeTable` 为数据库操作
4. 添加数据库连接池配置

## License

Private
