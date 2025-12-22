<!-- 自定义可排序侧边栏主组件 -->
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { sidebar } from '../../docsMetadata.json'
import type { ArticleTree } from '../../../scripts/types/metadata'
import CustomSidebarItem from './CustomSidebarItem.vue'

// 排序选项类型
type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

// 当前排序方式，默认按文件名升序（保持原有行为）
const currentSort = ref<SortOption>('name-asc')

// 深度克隆 ArticleTree 以避免直接修改原数据
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any
  const cloned: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key])
    }
  }
  return cloned
}

// 排序函数
function sortArticles(articles: ArticleTree[], sortType: SortOption): ArticleTree[] {
  const sorted = [...articles]
  
  switch (sortType) {
    case 'name-asc':
      sorted.sort((a, b) => a.text.localeCompare(b.text, 'zh-CN'))
      break
    case 'name-desc':
      sorted.sort((a, b) => b.text.localeCompare(a.text, 'zh-CN'))
      break
    case 'updated-desc':
      sorted.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
      break
    case 'updated-asc':
      sorted.sort((a, b) => (a.lastUpdated || 0) - (b.lastUpdated || 0))
      break
    case 'created-desc':
      sorted.sort((a, b) => (b.created || 0) - (a.created || 0))
      break
    case 'created-asc':
      sorted.sort((a, b) => (a.created || 0) - (b.created || 0))
      break
  }
  
  // 递归排序子项
  for (const item of sorted) {
    if (item.items && item.items.length > 0) {
      item.items = sortArticles(item.items, sortType)
    }
  }
  
  return sorted
}

// 排序后的侧边栏数据
const sortedSidebar = computed(() => {
  const cloned = deepClone(sidebar)
  return sortArticles(cloned, currentSort.value)
})

// 监听排序变化，保存到 localStorage
watch(currentSort, (newValue) => {
  localStorage.setItem('sidebar-sort-preference', newValue)
})

// 组件挂载时，从 localStorage 读取偏好
onMounted(() => {
  const savedPreference = localStorage.getItem('sidebar-sort-preference') as SortOption | null
  if (savedPreference) {
    currentSort.value = savedPreference
  }
})
</script>

<template>
  <aside class="custom-sidebar">
    <!-- 排序控制器 - 固定在顶部 -->
    <div class="sidebar-sort-control">
      <div class="sort-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="sort-icon">
          <path
            d="M3 4H21M3 8H15M3 12H9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span>排序方式</span>
      </div>
      <select 
        v-model="currentSort" 
        class="sort-select"
        aria-label="侧边栏排序方式"
      >
        <option value="name-asc">文件名 (A-Z)</option>
        <option value="name-desc">文件名 (Z-A)</option>
        <option value="updated-desc">编辑时间 (从新到旧)</option>
        <option value="updated-asc">编辑时间 (从旧到新)</option>
        <option value="created-desc">创建时间 (从新到旧)</option>
        <option value="created-asc">创建时间 (从旧到新)</option>
      </select>
    </div>

    <!-- 侧边栏内容 - 可滚动区域 -->
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <CustomSidebarItem
          v-for="(item, index) in sortedSidebar"
          :key="index"
          :item="item"
          :depth="0"
        />
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.custom-sidebar {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--vp-c-bg-alt, var(--vp-c-bg));
  display: flex;
  flex-direction: column;
}

.sidebar-sort-control {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: var(--vp-c-bg-alt, var(--vp-c-bg));
  border-bottom: 1px solid var(--vp-c-divider);
  position: sticky;
  top: 0;
  z-index: 1;
}

.sort-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sort-icon {
  color: var(--vp-c-text-3);
}

.sort-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.25s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
}

.sort-select:hover {
  border-color: var(--vp-c-brand-1);
}

.sort-select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 0 transparent;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav {
  padding: 16px 8px 96px;
}

/* 滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}

/* 暗色模式适配 */
html.dark .sort-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

/* 响应式设计 - 移动端 */
@media (max-width: 960px) {
  .custom-sidebar {
    height: auto;
  }

  .sidebar-sort-control {
    padding: 12px 24px;
  }

  .sidebar-content {
    /* 移动端内容区域自动填充剩余空间 */
  }

  .sidebar-nav {
    padding: 12px 16px 96px;
  }
}

/* 平板端 */
@media (min-width: 961px) and (max-width: 1280px) {
  .custom-sidebar {
    width: 256px;
  }
}
</style>
