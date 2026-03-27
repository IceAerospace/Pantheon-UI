# Pantheon UI

**English** | [中文](#中文)

A desktop application for [PantheonOS](https://github.com/aristoteleo/PantheonOS) — a multi-agent collaboration framework. Built with **Tauri 2.0 + React + TypeScript + Vite**.

---

## Features

- 💬 **Chat** — Send messages with streaming responses, Markdown rendering, and syntax-highlighted code blocks
- 📂 **Session Management** — Create, rename, delete, and restore conversation history
- 🤖 **Agent & Team Management** — Browse agents, switch active agent, apply team templates
- 🛒 **Pantheon Store** — Search, install, and uninstall Agents / Teams / Skills
- 🔧 **Settings** — Light/Dark/System theme, API Keys management (OpenAI, Anthropic, Gemini…)
- 📋 **Background Tasks** — Monitor, cancel, and remove background tasks
- 🔌 **NATS Connection** — Connect to any PantheonOS ChatRoom service via NATS WebSocket
- 🗂️ **File Upload** — Drag-and-drop file attachment in chat
- 🖥️ **System Tray** — Minimize to system tray with right-click menu

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | [Tauri 2.0](https://tauri.app) (Rust) |
| Frontend | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite 6](https://vitejs.dev) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Styling | CSS Modules + CSS Variables |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| Syntax Highlight | [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) |
| NATS | [nats.ws](https://github.com/nats-io/nats.ws) |
| Icons | [Lucide React](https://lucide.dev/) |
| Persistence | [tauri-plugin-store](https://github.com/tauri-apps/tauri-plugin-store) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/) for your platform

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/IceAerospace/Pantheon-UI.git
cd Pantheon-UI

# Install JavaScript dependencies
npm install

# Start development server (Tauri + Vite hot-reload)
npm run tauri dev
```

### Build for Production

```bash
npm run tauri build
```

The installable bundle will be in `src-tauri/target/release/bundle/`.

---

## Backend: PantheonOS

Pantheon UI communicates with a running **PantheonOS ChatRoom** service via NATS WebSocket.

1. Start a PantheonOS backend with NATS enabled (default `ws://localhost:4222`).
2. Launch Pantheon UI — the **Connection Dialog** will open automatically.
3. Enter the NATS WebSocket URL and the ChatRoom **Service ID**, then click **Connect**.

---

## Project Structure

```
Pantheon-UI/
├── src-tauri/                 # Tauri (Rust) backend
│   ├── src/
│   │   ├── main.rs            # Entry point
│   │   ├── lib.rs             # Tauri builder + command registration
│   │   ├── commands/
│   │   │   └── settings.rs    # IPC: read/write local settings
│   │   └── tray.rs            # System tray setup
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── capabilities/
│       └── default.json
├── src/                       # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── chat/              # ChatView, MessageList, InputBox, CodeBlock...
│   │   ├── sidebar/           # Sidebar, SessionList, AgentPanel
│   │   ├── store/             # StoreView, StoreCard, StoreSearch
│   │   ├── settings/          # SettingsView, ApiKeysPanel, ThemeToggle
│   │   ├── team/              # TeamSelector, TemplateEditor
│   │   ├── tasks/             # BackgroundTasks
│   │   ├── connection/        # ConnectionDialog, StatusBar
│   │   └── layout/            # AppLayout
│   ├── services/
│   │   ├── nats-client.ts     # NATS WebSocket client (connect/RPC/stream)
│   │   ├── chatroom-api.ts    # All ChatRoom @tool method wrappers
│   │   └── store-api.ts       # Store-specific helpers
│   ├── stores/                # Zustand stores
│   │   ├── connection-store.ts
│   │   ├── chat-store.ts
│   │   ├── agent-store.ts
│   │   └── settings-store.ts
│   ├── hooks/
│   │   ├── useNats.ts
│   │   ├── useChat.ts
│   │   └── useStreaming.ts
│   ├── types/
│   │   └── index.ts           # All TypeScript type definitions
│   ├── utils/
│   │   ├── markdown.ts
│   │   └── theme.ts
│   └── styles/
│       └── globals.css        # CSS variables + global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## NATS / RPC Protocol

The app uses the **Magique RPC** protocol over NATS:

- **Subject**: `magique.{serviceId}.{methodName}`
- **Request**: `{ method, params, requestId }`
- **Response**: `{ result, error, requestId }`
- **Streaming**: chunks published to `pantheon.stream.{chatId}`

---

## ChatRoom API Coverage

All 40+ `@tool` methods of `pantheon/chatroom/room.py` are mapped in `src/services/chatroom-api.ts`:

| Category | Methods |
|----------|---------|
| Session | create_chat, list_chats, get_chat_messages, rename_chat, delete_chat, get_chat_meta |
| Chat | chat (streaming) |
| Agent/Team | get_agents, set_active_agent, get_active_agent, setup_team_for_chat, list_team_templates, get_team_template |
| Endpoint | get_endpoint, set_endpoint |
| Toolsets | get_toolsets, proxy_toolset |
| Store | search_store, install_store_item, uninstall_store_item, list_installed_store_items |
| Tasks | list_background_tasks, get_background_task_detail, cancel_background_task, remove_background_task |
| Settings | get_settings, update_settings, get_api_keys_status, update_api_key |
| Voice | transcribe_audio |
| Gateway | get_gateway_channel_config, save_gateway_channel_config, list_gateway_channels, start_gateway_channel, stop_gateway_channel, wechat_login_qr, wechat_login_status, list_gateway_sessions |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Send message |
| Shift+Enter | New line in message |
| Escape | Clear input |
| Ctrl/Cmd+N | New chat session |

---

## License

MIT

---

<a name="中文"></a>

# Pantheon UI（中文）

PantheonOS 的桌面应用客户端，基于 **Tauri 2.0 + React + TypeScript + Vite** 构建。

## 功能特性

- 💬 **聊天核心** — 流式响应、Markdown 渲染、代码语法高亮 + 一键复制
- 📂 **会话管理** — 新建/重命名/删除会话，侧边栏历史列表
- 🤖 **Agent/团队管理** — Agent 列表、切换活跃 Agent、团队模板选择
- 🛒 **Pantheon Store** — 浏览/搜索/安装/卸载 Agents/Teams/Skills
- 🔧 **设置** — 亮色/暗色/跟随系统主题，API Keys 管理
- 📋 **后台任务** — 任务列表、进度、取消/移除
- 🔌 **NATS 连接** — 连接到任意 PantheonOS ChatRoom 服务
- 🗂️ **文件上传** — 拖拽上传文件附件
- 🖥️ **系统托盘** — 最小化到托盘，右键菜单

## 快速开始

```bash
git clone https://github.com/IceAerospace/Pantheon-UI.git
cd Pantheon-UI
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```
