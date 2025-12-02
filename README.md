# AI-Mock

轻量级接口模拟工具（Chrome 扩展），基于 Vue 3 + Vite + Element Plus。面向前端/联调场景，提供可视化的规则管理、JSON 树形编辑、AI 一键生成 Mock 数据，以及便捷的搜索与操作体验。

## 主要功能

- 规则管理
  - URL 匹配：包含/完整匹配，支持请求方法 ALL/GET/POST/PUT/DELETE
  - 备注、启用/禁用、删除、清空；更多操作集中于“···”下拉
- Mock 响应
  - JSON 树形编辑器，双击叶子即可编辑；即时保存到 `chrome.storage.local`
  - 行内“Mock 响应”可折叠/展开，列表视图更干净
  - 文本框工具条：格式化 / 验证 / 复制 / 清空；支持“⛶ 放大”弹窗查看编辑
  - 流式生成时自动滚动到底部，跟随最新输出
- AI 生成（DeepSeek）
  - 输入接口类型/结构描述，SSE 流式生成 Mock JSON
  - Token 失效（401/expired/invalid）：弹窗提示重新输入 API Key 并更新
  - 额度不足（429/402/quota/limit）：明确错误提示，不再泛化
- 搜索过滤
  - 在“已添加规则”上方按“备注/URL”搜索；无结果时显示“查询结果为空”
- UI 与概览
  - 顶部概览卡：总规则、已启用、已禁用；数字居中，语义化配色
  - 全局提示统一用 Element Plus `ElMessage`

## 快速开始

### 环境要求

- Node.js >= 20
- 包管理器：pnpm

### 安装依赖

```
pnpm install
```

### 开发调试

```
pnpm dev
```

如在 mac arm64 遇到构建问题（npm 的已知问题），可尝试：

```
npm install @rollup/rollup-darwin-arm64
```

或删除 `package-lock.json` 后重装依赖。

### 本地打包

```
pnpm run build
```

打包成功后，`dist` 目录直接在chrome://extensions/页面加载即可。

##

1. 添加规则：选择匹配模式与方法，填写 URL 与备注，点击添加/保存
2. AI 生成：在“AI 生成”输入接口类型/结构描述，点击“生成”，自动填充 Mock JSON
3. 编辑数据：
   - 列表中点击“Mock 响应”展开树形编辑器，双击叶子修改，实时保存
   - 使用工具条进行“格式化/验证/复制/清空”；需要大视图时点击“⛶ 放大”
4. 搜索与管理：在搜索框按“备注/URL”过滤；编辑/删除在“···”下拉菜单；清空支持二次确认

## DeepSeek API Key

- 首次生成或缺失时会提示设置 API Key（保存在 `localStorage` 的 `DEEPSEEK_API_KEY`）
- 失效/过期时（401/invalid/expired）：弹窗要求重新输入并更新 Key
- 配额不足（429/402/quota/limit）：提示额度问题，请检查账户或稍后重试

## 目录结构概览

```
src/
  ├─ views/AiMock/        # Mock 侧边栏的UI及交互
  ├─ http/                # 请求封装
  ├─ store/               # 状态（pinia）
  ├─ style/               # 样式与主题
  ├─ BackgroundScript/    # 后台脚本，处理 API 请求与响应
  ├─ contentScript/       # 内容脚本
  ├─ injected/            # 注入页面的脚本，用于修改页面行为
  └─ types/               # TypeScript 类型
```

## Git Hooks（可选）

设置执行权限：

- Windows：`attrib +x .husky/pre-commit`
- macOS/Linux：`chmod +x .husky/pre-commit`

## 备注

- 开发模式下若遇到 “Extension context invalidated” 一般为扩展热重载导致，刷新页面或在 `chrome://extensions` 中重载扩展即可
- 不建议在生产构建中依赖本地未持久化的 Key，必要时请在企业环境中走安全配置方案
