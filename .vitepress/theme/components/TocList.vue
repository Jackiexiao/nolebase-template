<!-- 目录 -->
<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import type { ArticleTree } from '../../../scripts/types/metadata'
  import { sidebar } from '../../docsMetadata.json'
  import CalendarFilter from './CalendarFilter.vue'

const list = computed(() => {
  const list: ArticleTree[] = ([] as any).concat(...sidebar.map(series => [...series?.items.map(item => ({ ...item, category: series.text }))]))
  for (let i = 0; i < list.length; i++) {
    const items = list[i].items
    if (items)

      list.push(...items.map(item => ({ ...item, category: list[i].category })))
  }
  return list.filter(item => item.link)
})

// 排序选项类型
type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

// 当前排序方式
const currentSort = ref<SortOption>('updated-desc')

// 排序函数
const sortArticles = (articles: ArticleTree[], sortType: SortOption): ArticleTree[] => {
  const sorted = [...articles]
  
  switch (sortType) {
    case 'name-asc':
      return sorted.sort((a, b) => a.text.localeCompare(b.text, 'zh-CN'))
    case 'name-desc':
      return sorted.sort((a, b) => b.text.localeCompare(a.text, 'zh-CN'))
    case 'updated-desc':
      return sorted.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
    case 'updated-asc':
      return sorted.sort((a, b) => (a.lastUpdated || 0) - (b.lastUpdated || 0))
    case 'created-desc':
      return sorted.sort((a, b) => (b.created || 0) - (a.created || 0))
    case 'created-asc':
      return sorted.sort((a, b) => (a.created || 0) - (b.created || 0))
    default:
      return sorted
  }
}

const sortedList = computed(() => {
  return sortArticles(list.value, currentSort.value)
})

// 筛选后的文章列表
const filteredList = ref<ArticleTree[]>(sortedList.value)

// 处理筛选事件
const handleFilter = (filteredItems: ArticleTree[]) => {
  filteredList.value = sortArticles(filteredItems, currentSort.value)
}

// 处理排序变更
const handleSortChange = (sortType: SortOption) => {
  currentSort.value = sortType
  filteredList.value = sortArticles(filteredList.value, sortType)
}
</script>

<template>
  <div class="toc-container">
    <CalendarFilter :items="list" @filter="handleFilter" />
    
    <div class="filter-results">
      <div class="results-header">
        <h2 class="results-title">最近更新</h2>
        <div class="results-actions">
          <select 
            v-model="currentSort" 
            @change="handleSortChange(currentSort)" 
            class="sort-select"
            aria-label="排序方式"
          >
            <option value="name-asc">文件名 (A-Z)</option>
            <option value="name-desc">文件名 (Z-A)</option>
            <option value="updated-desc">编辑时间 (从新到旧)</option>
            <option value="updated-asc">编辑时间 (从旧到新)</option>
            <option value="created-desc">创建时间 (从新到旧)</option>
            <option value="created-asc">创建时间 (从旧到新)</option>
          </select>
          <div class="results-count">
            共 {{ filteredList.length }} 个结果
          </div>
        </div>
      </div>
      
      <div v-if="filteredList.length > 0" class="results-list">
        <div v-for="item of filteredList" :key="item.link" class="result-item">
          <a :href="item.link">
            <h3 m="0">
              {{ item.text }}
            </h3>
          </a>
          <div class="item-meta">
            <div class="meta-item">
              <span class="i-octicon:repo-16 align-middle text-xs opacity-50" />
              <span class="align-middle opacity-50">
                类别：
              </span>
              <span class="category-tag">{{ item.category }}</span>
            </div>
            <div class="meta-item">
              <span class="i-octicon:history-16 align-middle text-xs" />
              <span class="align-middle">
                更新时间：{{ new Date(item.lastUpdated || 0).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-results">
        <div class="no-results-icon">
          <span class="i-octicon:search-24"></span>
        </div>
        <div class="no-results-text">
          没有找到符合筛选条件的更新内容
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toc-container {
  width: 100%;
}

.filter-results {
  margin-top: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-border);
}

.results-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.results-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  padding: 6px 32px 6px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
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
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.results-count {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  padding: 16px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  transition: all 0.2s;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--vp-shadow-2);
}

.result-item h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-brand);
}

.result-item a {
  text-decoration: none;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tag {
  background-color: var(--vp-c-bg-mute);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  color: var(--vp-c-text-3);
  margin-bottom: 16px;
}

.no-results-text {
  font-size: 16px;
  color: var(--vp-c-text-2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .results-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .sort-select {
    width: 100%;
  }
  
  .results-count {
    text-align: center;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-item {
    padding: 12px;
  }
}

/* 暗色模式适配 */
html.dark .sort-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}
</style>
