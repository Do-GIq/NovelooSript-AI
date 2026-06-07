# Novel2Script-AI

Novel2Script-AI 是一个 AI 小说转 YAML 剧本工具。用户可以粘贴或上传小说文本，系统会基于大模型能力生成结构化剧本初稿，包括角色、场景、对白、动作等内容。

项目目标是帮助小说作者快速获得可编辑、可继续打磨的剧本初稿，降低小说改编为剧本的门槛。

---

## 一、项目亮点

- 支持小说正文粘贴
- 支持 txt 小说文件上传
- 支持剧本风格选择
- 支持 AI 生成 YAML 剧本
- 支持 YAML 复制
- 支持 YAML 简单格式化
- 支持 YAML 文件导出
- 支持示例预览弹窗
- 支持一键填入示例小说
- 支持生成耗时展示
- 支持无 API Key 时 fallback 备用结果
- 前端采用简约 GPT-like 工作台风格，降低用户理解成本

---

## 二、技术栈

### 前端

- Vue 3
- TypeScript
- Vite
- Element Plus
- Axios

### 后端

- Node.js
- Express
- TypeScript
- Zod
- dotenv
- OpenAI-compatible Chat Completions API

### 大模型接口

项目后端使用 OpenAI-compatible API 调用方式。

当前推荐使用阿里云通义千问 DashScope 兼容接口，也可以替换成其他兼容 OpenAI Chat Completions 格式的大模型服务。

---

## 三、项目目录

```text
Novel2Script-AI
├── backend
│   ├── src
│   │   ├── prompts
│   │   ├── services
│   │   ├── index.ts
│   │   └── types.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── utils
│   │   ├── App.vue
│   │   └── style.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── docs
│   └── schema.md
│
├── .gitignore
└── README.md


## 本地运行

### 1. 启动后端

```bash
cd backend
npm install
npm run dev

## 本地运行

### 1. 启动前端

```bash
cd frontend
npm install
npm run dev