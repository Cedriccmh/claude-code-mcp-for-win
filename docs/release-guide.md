# 发布指南

本文档描述 claude-code-mcp 的完整发布流程，确保每次发布的质量和一致性。

## 发布前检查清单

### 代码质量检查
- [ ] GitHub CI 上的所有测试通过
- [ ] 本地运行 linter：`npm run lint`
- [ ] 本地运行类型检查：`npm run typecheck`
- [ ] 本地运行所有测试：`npm test`
- [ ] 本地构建项目：`npm run build`

### 版本和文档更新
- [ ] 更新 `CHANGELOG.md` 版本号和变更内容
- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `src/server.ts` 中的 `SERVER_VERSION` 常量
- [ ] 确保版本号在上述三处保持一致

## 本地测试发布

在正式发布前，应该在本地验证打包后的版本：

### 方法一：使用测试脚本（推荐）

```bash
# 运行自动化测试发布脚本
./scripts/test-release.sh
```

这个脚本会：
- 构建项目
- 运行所有测试
- 在 Claude Desktop 中配置本地测试环境

### 方法二：手动测试

1. **打包并本地安装**
   ```bash
   npm pack
   npm install -g ./steipete-claude-code-mcp-<version>.tgz
   ```

2. **在 Claude Desktop 中测试**
   - 重启 Claude Desktop 应用
   - 使用 `claude-code-local` 工具测试
   - 验证版本信息在首次使用时正确显示
   - 测试各种命令确保功能正常

3. **恢复原配置**
   ```bash
   # 测试完成后恢复
   ./scripts/restore-config.sh
   ```

### 测试配置文件位置
- **生产配置**: `/Library/Application Support/Claude/claude_desktop_config.json`
- **测试配置**: `/Library/Application Support/Claude/claude_desktop_config_local_test.json`

**重要**: 始终先使用本地配置测试，验证无误后再发布！

## 正式发布流程

### 使用自动化脚本（推荐）

本地测试完成后，使用发布脚本：

```bash
./scripts/publish-release.sh
```

这个脚本会自动执行以下步骤：
1. 确认当前在 main 分支
2. 运行测试套件
3. 构建项目
4. 提示选择版本类型（patch/minor/major）
5. 自动更新版本号
6. 更新 CHANGELOG.md
7. 创建 git tag
8. 推送到 GitHub
9. 创建 GitHub Release
10. 发布到 npm

### 手动发布步骤

如果需要手动发布：

1. **推送所有更改**
   ```bash
   git add .
   git commit -m "chore: prepare release vX.Y.Z"
   git push origin main
   ```

2. **创建和推送 tag**
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. **发布到 npm**
   ```bash
   npm publish
   ```

4. **创建 GitHub Release**
   - 访问 GitHub 仓库的 Releases 页面
   - 基于刚创建的 tag 创建新 Release
   - 复制 CHANGELOG.md 中的相关内容作为 Release Notes

## 版本号指南

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **Patch (x.y.Z)**: Bug 修复、文档更新、性能优化
  - 示例：1.10.12 → 1.10.13
  - 场景：修复空 prompt 验证、更新 README

- **Minor (x.Y.0)**: 新功能、非破坏性改动
  - 示例：1.10.13 → 1.11.0
  - 场景：添加新的环境变量支持、增强错误处理

- **Major (X.0.0)**: 破坏性改动、重大重构
  - 示例：1.11.0 → 2.0.0
  - 场景：更改 API 接口、删除已弃用功能

### 特殊情况

- **纯文档/图片更新**: 不需要版本升级
- **README 图片更新**: 确保 Git 提交包含图片文件和 README 更改
- **PR 分支提交**: 自动推送到远程分支以便代码审查

## 紧急修复发布

对于需要快速修复的严重问题：

1. **修复问题**
   ```bash
   # 创建修复分支
   git checkout -b hotfix/critical-issue
   # 进行修复
   # ...
   ```

2. **本地测试**
   ```bash
   ./scripts/test-release.sh
   ```

3. **合并并发布**
   ```bash
   git checkout main
   git merge hotfix/critical-issue
   ./scripts/publish-release.sh
   # 选择 patch 版本
   ```

## 发布后验证

发布完成后，进行以下验证：

1. **npm 可用性检查**
   ```bash
   # 在新的临时目录中测试
   npx @steipete/claude-code-mcp@latest --help
   ```

2. **GitHub Release 检查**
   - 确认 Release 已创建
   - 验证 Release Notes 格式正确
   - 检查标签链接正常

3. **文档更新**
   - 确认 npm 页面显示最新版本
   - 验证 README badges 显示正确版本

## 常见问题

### 发布失败了怎么办？

**npm 发布失败**:
```bash
# 检查 npm 登录状态
npm whoami
# 如果未登录
npm login
# 重新发布
npm publish
```

**Git push 失败**:
```bash
# 检查远程状态
git fetch origin
git status
# 如果有冲突，解决后重新推送
git push origin main --force-with-lease
```

### 版本号搞错了怎么办？

**在发布前发现**:
- 直接修改相关文件，重新提交

**已经发布到 npm**:
- 使用 `npm deprecate` 标记错误版本
- 立即发布正确版本

```bash
npm deprecate @steipete/claude-code-mcp@X.Y.Z "请使用 X.Y.Z+1 版本"
```

### 如何回滚发布？

npm 不支持删除已发布的包，但可以：

1. **弃用有问题的版本**
   ```bash
   npm deprecate @steipete/claude-code-mcp@X.Y.Z "此版本存在问题，请升级到 X.Y.Z+1"
   ```

2. **立即发布修复版本**
   - 修复问题
   - 增加 patch 版本号
   - 快速发布

## 最佳实践

1. **发布节奏**
   - 定期发布小更新（每 1-2 周）
   - 重大功能单独发布 minor 版本
   - 紧急修复随时发布 patch

2. **沟通**
   - 在 CHANGELOG.md 中清晰记录所有变更
   - 破坏性改动需要在 Release Notes 中特别标注
   - 考虑在 GitHub Discussions 中预告重大更新

3. **质量保证**
   - 永远不要跳过测试
   - 重要更新要进行更全面的手动测试
   - 保持 CI/CD 流程健康

4. **Git 工作流**
   - 保持 main 分支随时可发布
   - 使用 feature 分支开发新功能
   - PR 合并前确保所有检查通过

## 相关资源

- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)
- [npm 发布文档](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**最后更新**: 2025-10-18


