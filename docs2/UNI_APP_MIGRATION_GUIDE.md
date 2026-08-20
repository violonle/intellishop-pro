# HTML原型到uni-app Vue迁移指南

## 📋 迁移概述

本指南说明如何将现有的HTML静态原型逐步迁移到uni-app Vue3架构。

## 🏗️ 项目结构对比

### 原始结构（HTML原型）
```
pages/
├── dashboard.html
├── leads.html
├── customer-detail.html
├── product-management.html
└── ...其他HTML文件
```

### 新结构（uni-app Vue3）
```
shoppro-app/
├── src/
│   ├── pages/          # Vue页面组件
│   ├── components/     # 可复用组件
│   ├── services/       # API服务
│   ├── stores/         # 状态管理
│   └── styles/         # 样式文件
├── pages.json          # uni-app配置
└── package.json        # 项目配置
```

## 🔄 迁移步骤

### 第一步：项目初始化
```bash
cd /Users/yangyong/codebuddy/ShopPro/shoppro-app
npm install
# 或使用 pnpm install
```

### 第二步：开发预览
```bash
npm run dev:h5
# 访问 http://localhost:5173
```

### 第三步：逐页面迁移

#### 1. HTML转Vue的关键转换

**HTML中的标签映射**：
```html
<!-- HTML -->
<div></div>
<p>文本</p>
<img src="">
<input type="text">

<!-- Vue转换 -->
<view></view>
<text>文本</text>
<image src=""></image>
<input type="text">
```

#### 2. 样式迁移

**从HTML内联样式到Vue scoped样式**：
```html
<!-- HTML原型 -->
<div style="color: #4640DE; padding: 16px;">内容</div>

<!-- Vue组件 -->
<template>
  <view class="content">内容</view>
</template>

<style scoped>
.content {
  color: #4640DE;
  padding: 16px;
}
</style>
```

#### 3. JavaScript逻辑迁移

**从HTML中的script到Vue的setup**：
```javascript
// HTML中的JavaScript
<script>
function handleClick() {
  console.log('clicked')
}
</script>

// Vue Setup语法
<script setup>
const handleClick = () => {
  console.log('clicked')
}
</script>
```

#### 4. 数据绑定

**从原生JavaScript到Vue响应式**：
```javascript
// 原始方式
const leads = [...]
document.getElementById('list').innerHTML = leads.map(...).join('')

// Vue方式
import { ref } from 'vue'
const leads = ref([...])
// 模板中自动双向绑定
```

### 第四步：组件复用

#### 原始HTML中的重复代码
```html
<!-- 多个页面中重复的按钮代码 -->
<button class="bg-primary text-white px-4 py-2 rounded">提交</button>
```

#### 转换为可复用Vue组件
```vue
<!-- src/components/common/Button.vue -->
<template>
  <button :class="buttonClass" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'primary' }
})
defineEmits(['click'])
</script>

<!-- 在其他页面使用 -->
<Button @click="handleSubmit">提交</Button>
```

## 📄 迁移检查清单

### 页面迁移进度

- [ ] Dashboard 首页
- [ ] Leads 线索管理
- [ ] Leads Detail 线索详情
- [ ] Customer 客户管理
- [ ] Customer Detail 客户详情
- [ ] Product 产品管理
- [ ] Product Detail 产品详情
- [ ] Analytics 数据分析
- [ ] Profile 个人中心
- [ ] Settings 系统设置
- [ ] AI Brain AI大脑

### 功能验证清单

- [ ] 页面渲染正确
- [ ] 搜索/筛选功能
- [ ] 列表加载和分页
- [ ] 表单提交
- [ ] API调用
- [ ] 导航链接
- [ ] 样式显示
- [ ] 响应式布局

## 🔧 常见迁移问题

### 问题1：HTML中的全局变量和函数
```javascript
// HTML中（不好的做法）
<script>
window.globalData = {...}
function globalFunction() {...}
</script>

// Vue中应该使用
// src/stores/app.js
import { defineStore } from 'pinia'
export const useAppStore = defineStore('app', () => {
  // 使用 ref 代替全局变量
  const globalData = ref(...)
  const globalFunction = () => {...}
  return { globalData, globalFunction }
})
```

### 问题2：DOM操作
```javascript
// HTML中（不好的做法）
document.getElementById('list').innerHTML = '...'
document.querySelector('.btn').addEventListener('click', () => {})

// Vue中应该使用响应式数据和事件处理
<template>
  <view id="list">{{ content }}</view>
  <button @click="handleClick">按钮</button>
</template>

<script setup>
const content = ref('...')
const handleClick = () => { /* ... */ }
</script>
```

### 问题3：异步数据加载
```javascript
// HTML中（可能的做法）
<script>
fetch('/api/leads')
  .then(r => r.json())
  .then(data => {
    // 手动更新DOM
  })
</script>

// Vue中使用现代方式
<script setup>
import { ref, onMounted } from 'vue'
import { leadsApi } from '@/services/api'

const leads = ref([])

onMounted(async () => {
  try {
    leads.value = await leadsApi.list()
  } catch (error) {
    console.error(error)
  }
})
</script>
```

## 🎨 样式迁移指南

### Tailwind CSS使用
```vue
<!-- 直接在模板中使用 Tailwind 类 -->
<view class="p-4 bg-white rounded-lg shadow-sm">
  <text class="text-lg font-bold text-primary">标题</text>
</view>
```

### 自定义样式
```vue
<style scoped>
/* Tailwind不覆盖的样式写在这里 */
.custom-style {
  custom-property: value;
}
</style>
```

### 颜色变量
已在 `tailwind.config.js` 中定义：
- `primary` - 主色 #4640DE
- `secondary` - 次色 #8B5CF6
- `success` - 成功 #10B981
- `warning` - 警告 #F59E0B
- `danger` - 危险 #EF4444

## 📱 多平台适配

### H5适配
```bash
npm run dev:h5    # 开发
npm run build:h5  # 生产构建
```

### 微信小程序
```bash
npm run dev:mp-weixin
# 使用HBuilderX打开项目进行真机测试
```

### APP适配
```bash
npm run dev:app
# 使用HBuilderX打开项目
```

## 🚀 快速迁移模板

### 新页面模板
```vue
<!-- src/pages/[module]/index.vue -->
<template>
  <view class="[module]-container">
    <!-- 页面内容 -->
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { [moduleApi] } from '@/services/api'

const data = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    data.value = await [moduleApi].list()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.[module]-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
```

### 新组件模板
```vue
<!-- src/components/[category]/[ComponentName].vue -->
<template>
  <view :class="['component', customClass]">
    <slot />
  </view>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<style scoped>
.component {
  /* 样式 */
}
</style>
```

## 📊 迁移进度跟踪

使用以下命令检查迁移状态：
```bash
# 检查Vue文件数量
find src/pages -name "*.vue" | wc -l

# 检查完成的页面
git log --oneline | grep -i "migrate\|convert"
```

## 🔍 验证清单

迁移完成后的验证步骤：

1. **功能测试**
   - [ ] 所有页面能正常加载
   - [ ] 所有表单能正常提交
   - [ ] 所有列表能正常显示
   - [ ] 所有API调用能正常工作

2. **样式测试**
   - [ ] 桌面端样式正确
   - [ ] 移动端样式响应式
   - [ ] 深色模式正常
   - [ ] 字体和颜色正确

3. **性能测试**
   - [ ] 首页加载时间 < 2s
   - [ ] 列表加载时间 < 1s
   - [ ] 内存占用正常
   - [ ] 没有控制台错误

4. **兼容性测试**
   - [ ] Chrome浏览器
   - [ ] Safari浏览器
   - [ ] Firefox浏览器
   - [ ] 移动设备浏览器

## 📝 迁移总结

### 完成度
- 总页面数：11
- 已迁移：2（Dashboard、Leads）
- 待迁移：9
- 完成百分比：18%

### 预计时间
- Dashboard：✅ 完成
- Leads：✅ 完成
- Customer：⏳ 进行中
- Product：📋 计划中
- Analytics：📋 计划中
- 其他页面：📋 计划中

## 🆘 获取帮助

遇到迁移问题可参考：
1. [uni-app官方文档](https://uniapp.dcloud.io/)
2. [Vue 3文档](https://vuejs.org/)
3. [Tailwind CSS文档](https://tailwindcss.com/)
4. 项目README.md

---

**最后更新**: 2025年10月21日
**迁移状态**: 进行中
