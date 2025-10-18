# Claude Code MCP Server 项目总结

**文档创建时间**: 2025年10月17日  
**分析模型**: Claude Sonnet 4.5  
**项目版本**: 1.10.12

---

## 一、项目概述

### 1.1 项目简介
Claude Code MCP Server 是一个基于 Model Context Protocol (MCP) 的服务器，允许大型语言模型（LLMs）通过 MCP 协议直接调用 Claude Code CLI，实现自动化的代码操作和文件管理。该项目的核心价值在于提供了一个统一的 `claude_code` 工具，使得 Claude Desktop、Cursor、Windsurf 等 MCP 客户端能够以非交互模式执行复杂的多步骤编辑和操作。

### 1.2 核心特性
- **权限自动绕过**: 使用 `--dangerously-skip-permissions` 标志，实现无中断执行
- **统一工具接口**: 提供单一的 `claude_code` 工具处理所有操作
- **工作目录支持**: 支持自定义工作目录，精确控制执行环境
- **多模态能力**: 支持代码、文件、Git、终端、图像分析等多种操作
- **灵活配置**: 支持环境变量配置，可自定义 Claude CLI 路径

### 1.3 技术栈
- **运行时**: Node.js v20+
- **编程语言**: TypeScript
- **核心依赖**: 
  - `@modelcontextprotocol/sdk`: MCP 协议实现
  - `zod`: 参数验证
- **构建工具**: TypeScript Compiler (tsc)
- **测试框架**: Vitest

---

## 二、架构设计

### 2.1 核心组件

#### 2.1.1 ClaudeCodeServer 类
主服务器类，负责：
- MCP 服务器的初始化和配置
- 工具处理器的注册
- Claude CLI 路径的发现和管理
- 请求处理和错误管理

#### 2.1.2 Claude CLI 发现机制
```typescript
findClaudeCli() 函数优先级：
1. 检查 CLAUDE_CLI_NAME 环境变量
   - 支持绝对路径
   - 拒绝相对路径（安全考虑）
   - 支持自定义命令名
2. 检查本地安装路径: ~/.claude/local/claude
3. 回退到 PATH 查找
```

#### 2.1.3 spawnAsync 函数
异步进程执行封装：
- 超时控制（默认 30 分钟）
- 标准输出/错误流捕获
- 详细的错误信息
- 调试日志支持

### 2.2 工具定义

#### claude_code 工具
**输入参数**:
- `prompt` (必需): 自然语言提示词
- `workFolder` (可选): 工作目录的绝对路径

**功能范围**:
1. **文件操作**: 创建、读取、编辑、移动、复制、删除、列表
2. **代码处理**: 生成、分析、重构、修复
3. **版本控制**: Git stage、commit、push、tag 等完整工作流
4. **终端命令**: 执行任意 CLI 命令、打开 URL
5. **Web 搜索**: 搜索并总结网络内容
6. **多步骤工作流**: 版本发布、变更日志更新等复杂流程
7. **GitHub 集成**: 创建 PR、检查 CI 状态
8. **图像分析**: OCR 和图像内容分析

### 2.3 执行流程

```
MCP Client (Cursor/Windsurf)
    ↓
MCP Request (claude_code tool)
    ↓
ClaudeCodeServer.setupToolHandlers()
    ↓
参数验证 & 工作目录解析
    ↓
spawnAsync(claudeCliPath, args, {cwd})
    ↓
Claude CLI 执行
    ↓
返回结果 (stdout) 或错误
```

---

## 三、配置与部署

### 3.1 安装方式

#### 方式一：NPX（推荐）
```json
{
  "claude-code-mcp": {
    "command": "npx",
    "args": ["-y", "@steipete/claude-code-mcp@latest"]
  }
}
```

#### 方式二：全局安装
```bash
npm install -g @steipete/claude-code-mcp
```

#### 方式三：本地开发
```bash
git clone <repo>
npm install
npm run build
npm link
```

### 3.2 配置文件位置

**Cursor**:
- macOS: `~/.cursor/mcp.json`
- Windows: `%APPDATA%\Cursor\mcp.json`
- Linux: `~/.config/cursor/mcp.json`

**Windsurf**:
- macOS: `~/.codeium/windsurf/mcp_config.json`
- Windows: `%APPDATA%\Codeium\windsurf\mcp_config.json`
- Linux: `~/.config/.codeium/windsurf/mcp_config.json`

### 3.3 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CLAUDE_CLI_NAME` | Claude CLI 命令名或绝对路径 | `claude` |
| `MCP_CLAUDE_DEBUG` | 启用调试日志 | `false` |

### 3.4 首次设置（重要）

**必须**先手动运行一次 Claude CLI 接受条款：
```bash
npm install -g @anthropic-ai/claude-code
claude --dangerously-skip-permissions
```

---

## 四、使用场景

### 4.1 典型用例

#### 场景一：代码生成与重构
```
"Refactor the function foo in main.py to be async."
"Generate a Python script to parse CSV data and output JSON."
```

#### 场景二：文件系统操作
```
"Create a new file named 'config.yml' in the 'app/settings' directory with [content]"
"Edit file 'style.css': Add a new CSS rule for h2 elements"
```

#### 场景三：Git 工作流
```
"Stage src/main.java, commit with message 'feat: Implement auth', push to develop branch"
```

#### 场景四：复杂多步骤流程
```
"1. Update version in package.json to 2.5.0
 2. Add CHANGELOG.md section for 2.5.0
 3. Stage files, commit, push
 4. Create and push git tag v2.5.0"
```

#### 场景五：AI 辅助分析
```
"Analyze my_script.py for potential bugs and suggest improvements"
"Your work folder is /project - Check the status of PR #42's CI checks"
```

### 4.2 提示词最佳实践

1. **简洁明确**: 清晰的步骤描述，无需客套话
2. **工作目录**: 使用 `workFolder` 参数指定上下文
3. **多行内容**: 先写入临时文件，使用后删除
4. **超时处理**: 遇到超时时拆分为更小的任务
5. **第二意见**: 遇到困难时让 Claude Code 提供分析建议
6. **相对路径**: 设置 `workFolder` 后可使用相对路径

---

## 五、技术实现细节

### 5.1 关键代码片段

#### 工具注册
```typescript:184:233:src/server.ts
this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'claude_code',
    description: `Claude Code Agent: Your versatile multi-modal assistant...`,
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: '...' },
        workFolder: { type: 'string', description: '...' }
      },
      required: ['prompt']
    }
  }]
}));
```

#### 工作目录处理
```typescript:265:281:src/server.ts
let effectiveCwd = homedir(); // 默认为用户主目录

if (toolArguments.workFolder && typeof toolArguments.workFolder === 'string') {
  const resolvedCwd = pathResolve(toolArguments.workFolder);
  
  if (existsSync(resolvedCwd)) {
    effectiveCwd = resolvedCwd;
  } else {
    debugLog(`[Warning] workFolder does not exist: ${resolvedCwd}`);
  }
}
```

#### 命令执行
```typescript:293:300:src/server.ts
const claudeProcessArgs = ['--dangerously-skip-permissions', '-p', prompt];

const { stdout, stderr } = await spawnAsync(
  this.claudeCliPath,
  claudeProcessArgs,
  { timeout: executionTimeoutMs, cwd: effectiveCwd }
);
```

### 5.2 错误处理

- **参数验证**: 使用 McpError 和 ErrorCode 枚举
- **超时管理**: 30 分钟默认超时，可检测 ETIMEDOUT
- **路径安全**: 拒绝相对路径，防止路径遍历
- **详细日志**: debugMode 下提供完整的 stdout/stderr

### 5.3 版本跟踪

服务器在首次工具使用时输出版本信息：
```typescript:287:291:src/server.ts
if (isFirstToolUse) {
  const versionInfo = `claude_code v${SERVER_VERSION} started at ${serverStartupTime}`;
  console.error(versionInfo);
  isFirstToolUse = false;
}
```

---

## 六、测试框架

### 6.1 测试结构

```
src/__tests__/
├── e2e.test.ts          # 端到端测试（使用 mock）
├── edge-cases.test.ts   # 边界情况测试
├── error-cases.test.ts  # 错误处理测试
├── server.test.ts       # 服务器单元测试
├── validation.test.ts   # 参数验证测试
├── version-print.test.ts # 版本输出测试
└── utils/
    ├── claude-mock.ts   # Mock Claude CLI 实现
    ├── mcp-client.ts    # Mock MCP 客户端
    └── test-helpers.ts  # 测试辅助函数
```

### 6.2 测试命令

```bash
npm test                  # 运行所有测试
npm run test:unit         # 仅单元测试
npm run test:e2e          # E2E 测试（使用 mock）
npm run test:e2e:local    # 本地集成测试（需要真实 Claude CLI）
npm run test:coverage     # 生成覆盖率报告
npm run test:watch        # 监视模式
```

### 6.3 Mock Claude CLI

测试使用 mock 实现：
- 创建假的可执行文件在 `~/.claude/local/claude`
- 基于提示词模式返回预设响应
- 模拟错误场景以测试错误处理
- 自动清理测试环境

### 6.4 测试覆盖范围

- ✅ 工具注册和发现
- ✅ 简单提示词执行
- ✅ 工作目录处理
- ✅ 错误处理和超时
- ✅ 输入验证
- ✅ 特殊字符处理
- ✅ 并发请求处理
- ✅ 路径遍历防护

---

## 七、项目优势

### 7.1 解决的痛点

1. **文件编辑能力不足**: Cursor/Windsurf 在复杂文件编辑时容易出错，Claude Code 更快更准确
2. **上下文空间优化**: 命令队列化执行，节省上下文空间，减少 compact 次数
3. **成本效益**: 使用 Anthropic Max 订阅可降低成本，将简单任务交给更便宜的模型
4. **更广系统访问**: Claude 有更广泛的系统访问权限，能处理 IDE 无法完成的任务
5. **Agent in Agent**: 创新的 AI 代理嵌套架构

### 7.2 与同类工具对比

| 特性 | Claude Code MCP | 直接使用 Cursor | 直接使用 Claude Desktop |
|------|-----------------|----------------|------------------------|
| 多步骤编辑 | ✅ 优秀 | ⚠️ 有时困难 | ⚠️ 有时困难 |
| 权限管理 | ✅ 自动绕过 | ✅ 内置 | ⚠️ 需手动批准 |
| 系统访问 | ✅ 完整 | ⚠️ 受限 | ✅ 完整 |
| 成本优化 | ✅ 可选模型 | ❌ 固定 | ❌ 固定 |
| 集成难度 | ⚠️ 需配置 | ✅ 开箱即用 | ✅ 开箱即用 |

---

## 八、项目演进

### 8.1 版本历史亮点

- **v1.6.0**: 引入工作目录解析功能
- **v1.7.0**: 工具重命名为 `claude_code`
- **v1.9.0**: `workFolder` 改为独立参数
- **v1.9.1**: 超时时间从 5 分钟增至 30 分钟
- **v1.10.0**: 支持 `CLAUDE_CLI_NAME` 环境变量和完整测试套件
- **v1.10.6**: 引入捆绑构建，提升启动速度
- **v1.10.11**: 回退到简单 TypeScript 编译，修复捆绑问题
- **v1.10.12**: 修复 MCP 服务器启动问题

### 8.2 开发实践

- **语义化版本**: 遵循 Semantic Versioning
- **变更日志**: 保持详细的 CHANGELOG.md
- **发布检查清单**: 提供 RELEASE_CHECKLIST.md
- **持续集成**: E2E 测试在 CI 中自动运行
- **代码质量**: ESLint 配置，TypeScript 严格模式

---

## 九、故障排查

### 9.1 常见问题

#### 问题：Command not found (claude-code-mcp)
**解决方案**:
- 全局安装时确保 npm global bin 在 PATH 中
- 使用 npx 时确保 npx 可用

#### 问题：Command not found (claude)
**解决方案**:
- 确保 Claude CLI 正确安装
- 运行 `claude --help` 或检查文档

#### 问题：权限问题
**解决方案**:
- 确保完成首次设置步骤
- 手动运行 `claude --dangerously-skip-permissions`

#### 问题：JSON 解析错误
**解决方案**:
- 将 `MCP_CLAUDE_DEBUG` 设为 `false`（调试日志会干扰 JSON）

#### 问题：ESM/Import 错误
**解决方案**:
- 确保使用 Node.js v20 或更高版本
- 检查 `package.json` 中的 `"type": "module"`

### 9.2 调试技巧

1. **启用调试模式**: 设置 `MCP_CLAUDE_DEBUG=true`
2. **检查服务器日志**: 查看 stderr 输出
3. **验证 Claude CLI**: 独立测试 Claude CLI
4. **检查权限**: macOS 可能需要文件夹权限授予
5. **查看 MCP 客户端日志**: 检查 Cursor/Windsurf 的日志输出

---

## 十、贡献指南

### 10.1 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/steipete/claude-code-mcp.git
cd claude-code-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test

# 开发模式（热重载）
npm run dev
```

### 10.2 提交 PR 流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 10.3 代码规范

- 遵循 TypeScript 最佳实践
- 使用 ESLint 配置
- 为新功能编写测试
- 更新 CHANGELOG.md
- 保持文档同步

---

## 十一、项目资源

### 11.1 仓库信息

- **GitHub**: https://github.com/steipete/claude-code-mcp
- **NPM**: https://www.npmjs.com/package/@steipete/claude-code-mcp
- **许可证**: MIT
- **作者**: Peter Steinberger

### 11.2 相关文档

- [README.md](../README.md) - 主要使用文档
- [CHANGELOG.md](../CHANGELOG.md) - 版本变更历史
- [local_install.md](./local_install.md) - 本地开发指南
- [e2e-testing.md](./e2e-testing.md) - E2E 测试文档
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) - 发布检查清单

### 11.3 依赖项目

- **Claude CLI**: https://github.com/anthropics/claude-code
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk
- **Cursor**: https://cursor.sh/
- **Windsurf**: https://codeium.com/windsurf

---

## 十二、未来展望

### 12.1 潜在改进方向

1. **性能优化**:
   - 实现连接池减少 CLI 启动开销
   - 增加请求缓存机制

2. **功能增强**:
   - 支持流式输出
   - 增加进度反馈
   - 支持取消长时间运行的任务

3. **安全加固**:
   - 增加更细粒度的权限控制
   - 实现操作审计日志
   - 支持沙箱执行环境

4. **开发者体验**:
   - 提供交互式设置向导
   - 增加更多使用示例
   - 构建可视化的工具测试界面

5. **测试完善**:
   - 增加性能基准测试
   - 实现压力测试场景
   - 添加视觉回归测试

### 12.2 生态系统集成

- 支持更多 MCP 客户端
- 与其他开发工具的深度集成
- 构建插件生态系统

---

## 十三、总结

Claude Code MCP Server 是一个创新的工具，通过 Model Context Protocol 将 Claude Code 的强大能力无缝集成到各种 AI 代码助手中。它解决了传统 IDE AI 助手在复杂多步骤操作、文件编辑和系统访问方面的局限性，为开发者提供了一个更强大、更灵活、更具成本效益的解决方案。

项目的核心价值在于：
- **统一接口**: 单一工具处理所有操作类型
- **自动化**: 绕过权限检查实现无中断执行
- **灵活性**: 支持广泛的使用场景和自定义配置
- **可靠性**: 完善的测试框架和错误处理
- **可扩展性**: 清晰的架构和活跃的社区支持

对于开发者而言，这是一个极具实用价值的工具，无论是日常开发、复杂重构还是自动化工作流，都能提供显著的生产力提升。随着 AI 辅助编程的不断发展，类似 Claude Code MCP Server 这样的"Agent in Agent"架构将成为未来开发工具生态系统的重要组成部分。

---

**文档版本**: 1.0  
**最后更新**: 2025年10月17日  
**分析基础**: claude-code-mcp v1.10.12

