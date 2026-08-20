# ShopPro 前端迁移指南（HTML → Vue）

## 目标
- 将 `/pages/*.html` 的静态页面分阶段迁移到 `shoppro-app/src/pages/*/index.vue`，统一采用 **uni-app + Vue3 + Tailwind** 架构。

## 当前进展
- 新增 Vue 页面：
  - `知识库` → `src/pages/knowledge/index.vue`
  - `营销话术` → `src/pages/scripts/index.vue`
  - `产品图册` → `src/pages/catalog/index.vue`
- 已在 `src/pages.json` 注册以上页面，可直接导航访问。

## 使用方法
- 前端项目目录：`shoppro-app/`
- 启动开发（H5）
```bash
cd shoppro-app
npm install
npm run dev:h5
# 访问地址： http://127.0.0.1:5173/
```

## 迁移规则
- 去除静态HTML中的 `<head>`、外链脚本；保留主体结构搬入 `<template>`。
- 样式统一使用 Tailwind（已在项目集成），无需再引入CDN版。
- 路由导航统一采用 `uni.navigateTo({ url: '/pages/.../index' })` 或 `uni.switchTab`。
- 组件化：重复卡片/列表提炼为组件，放置于 `src/components`。

## 页面映射（计划）
- `dashboard.html` → `src/pages/dashboard/index.vue`（已存在，后续补充内容）
- `product-catalog.html` → `src/pages/catalog/index.vue`（已创建）
- `ai-scripts.html` → `src/pages/scripts/index.vue`（已创建）
- `knowledge-base.html` → `src/pages/knowledge/index.vue`（已创建）
- 其余页面将按模块批次迁移：线索、客户、产品配置、销售、通知、设置等。

## 接口与数据
- 统一在 `src/services/api.js` 定义 API；页面通过服务调用数据并以响应式方式渲染。
- 全局状态使用 Pinia（`src/stores/app.js`）。

## 常见问题
- 页面标题与导航栏：编辑 `src/pages.json` 中 `navigationBarTitleText`。
- TabBar 配置：`src/pages.json` → `tabBar.list`。
- H5本地预览无法返回：使用 `history.back()` 与 `uni.switchTab` 回退策略。

### 开发服务器报错排查
- 若浏览器提示 `net::ERR_ABORTED /src/App.vue` 或 `[plugin:vite:vue] At least one <template> or <script> is required`：
  - 确认 `shoppro-app/vite.config.js` 仅启用 `@dcloudio/vite-plugin-uni`，不要同时启用 `@vitejs/plugin-vue`。
  - 确认 `src/App.vue` 至少包含 `<template>` 或 `<script>`（可使用最小SFC结构）。
  - 检查页面中是否引用了不存在的静态资源（如图片路径）。
  - 重启开发服务器：`bash scripts/dev_frontend.sh`。

## 变更记录
- 见 `docs2/docs/修改问题反馈记录.md`，记录每次迁移与问题修复。

---
 最后更新：自动生成（修复H5预览报错说明已补充）