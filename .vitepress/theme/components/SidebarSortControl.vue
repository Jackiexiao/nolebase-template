<!-- 侧边栏排序控制 -->
<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { sidebar } from '../../docsMetadata.json'
import type { ArticleTree } from '../../../scripts/types/metadata'

// 排序选项类型
type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

// 当前排序方式
const currentSort = ref<SortOption>('name-asc') // 默认文件名排序以保持原有行为

// 深度克隆ArticleTree以避免直接修改原数据
function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => deepClone(item))
  const cloned: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
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

// 应用排序
function applySorting() {
  const sortedData = deepClone(sidebar)
  const result = sortArticles(sortedData, currentSort.value)
  
  // 更新 VitePress 的侧边栏配置
  // 注意：这需要通过修改配置来实现，但 VitePress 的侧边栏是静态的
  // 我们需要另一种方法
  
  console.log('Sidebar sorting applied:', currentSort.value)
  console.log('Sorted sidebar:', result)
  
  // 保存偏好到 localStorage
  localStorage.setItem('sidebar-sort-preference', currentSort.value)
}

// 监听排序变化
watch(currentSort, () => {
  applySorting()
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
  <div class="sidebar-sort-control">
    <div class="sort-label">侧边栏排序:</div>
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
</template>

<style scoped>
.sidebar-sort-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
}

.sort-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sort-select {
  width: 100%;
  padding: 6px 32px 6px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
}

.sort-select:hover {
  border-color: var(--vp-c-brand);
}

.sort-select:focus {
  outline: none;
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

/* 暗色模式适配 */
html.dark .sort-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}
</style>
