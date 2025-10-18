# Claude Code MCP Server 项目总结

## 1. 项目概述

`claude-code-mcp` 是一个基于模型上下文协议（Model Context Protocol, MCP）的服务器。它的核心功能是将 Anthropic 的 `claude` 命令行工具封装成一个名为 `claude_code` 的强大工具，供其他大型语言模型（如在 Cursor 或 Windsurf 编辑器中运行的 AI Agent）调用。

该项目的主要目标是解决其他 AI Agent 在执行复杂、多步骤的编码任务时能力不足的问题。通过调用 `claude_code` 工具，AI Agent 可以利用 Claude Code 在文件操作、代码重构、版本控制和执行终端命令方面的强大能力，同时自动绕过所有权限验证，从而实现更流畅、更强大的自动化工作流。

## 2. 核心功能

该服务器只提供一个核心工具：`claude_code`。

*   **统一的入口**：通过一个简单的 `prompt`（自然语言指令）参数，AI Agent 就可以让 Claude Code 执行各种任务。
*   **权限绕过**：服务器在执行 `claude` 命令时，会自动添加 `--dangerously-skip-permissions` 标志，免去了人工交互确认的步骤。
*   **广泛的能力**：封装了 Claude Code 的全部功能，包括但不限于：
    *   **代码操作**：生成、分析、重构和修复代码。
    *   **文件系统操作**：创建、读取、修改、移动、删除文件和目录。
    *   **版本控制**：执行 `git` 命令，如 add, commit, push, tag 等。
    *   **终端命令执行**：运行任何终端命令，如 `npm run build`。
    *   **Web 搜索**：搜索网页并总结内容。
    *   **多步骤工作流**：自动完成更新版本号、修改 CHANGELOG、打 Git 标签等一系列操作。

## 3. 技术栈

*   **语言**：TypeScript
*   **运行环境**：Node.js (v20 或更高版本)
*   **核心依赖**：
    *   `@modelcontextprotocol/sdk`: 用于实现 MCP 服务器。
    *   `zod`: 用于数据校验。
*   **开发与测试**：
    *   `tsx`: 用于在开发环境中直接运行 TypeScript。
    *   `vitest`: 用于单元测试和端到端测试。
    *   `eslint`: 用于代码规范检查。

## 4. 项目结构

```
.
├── src/
│   ├── server.ts         # 服务器主逻辑，定义和实现 claude_code 工具
│   └── __tests__/        # 包含单元测试和端到端测试
├── docs/                 # 项目文档
├── scripts/              # 发布和测试脚本
├── package.json          # 项目元数据和依赖管理
├── tsconfig.json         # TypeScript 编译配置
└── vitest.config.ts      # Vitest 测试框架配置
```

## 5. 工作原理

1.  **启动服务器**：用户通过 `npx @steipete/claude-code-mcp` 命令启动 MCP 服务器。
2.  **客户端连接**：Cursor 或其他支持 MCP 的客户端会根据配置文件（如 `~/.cursor/mcp.json`）连接到此服务器。
3.  **工具调用**：当上层 AI Agent 需要执行复杂任务时，它会向 MCP 服务器发送一个 `call_tool` 请求，调用 `claude_code` 工具，并附带一个自然语言 `prompt` 作为参数。
4.  **命令执行**：`claude-code-mcp` 服务器接收到请求后，会在后台生成一个子进程，执行本地安装的 `claude` 命令行工具，并将 `prompt` 和 `--dangerously-skip-permissions` 等参数传递给它。
5.  **返回结果**：`claude` CLI 执行完成后，服务器会捕获其标准输出（stdout），并将输出结果作为工具调用的结果返回给上层 AI Agent。

## 6. 如何配置和使用

1.  **安装 Node.js**：确保系统中安装了 v20 或更高版本的 Node.js。
2.  **安装 Claude CLI**：通过 `npm install -g @anthropic-ai/claude-code` 安装 Claude 命令行工具。
3.  **手动授权**：首次使用时，必须在终端手动运行一次 `claude --dangerously-skip-permissions`，登录并同意相关条款。这是一次性操作。
4.  **配置 MCP 客户端**：在相应的配置文件（如 Cursor 的 `~/.cursor/mcp.json`）中，添加启动 `claude-code-mcp` 服务器的配置。

完成以上步骤后，AI Agent 就可以在需要时调用 `claude_code` 工具来完成各种复杂的任务了。
