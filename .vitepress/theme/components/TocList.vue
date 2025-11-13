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

const sortedList = computed(() => {
  const ls = [...list.value]
  return ls.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
})

// 筛选后的文章列表
const filteredList = ref<ArticleTree[]>(sortedList.value)

// 处理筛选事件
const handleFilter = (filteredItems: ArticleTree[]) => {
  filteredList.value = filteredItems.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
}
</script>

<template>
  <div class="toc-container">
    <CalendarFilter :items="list" @filter="handleFilter" />
    
    <div class="filter-results">
      <div class="results-header">
        <h2 class="results-title">最近更新</h2>
        <div class="results-count">
          共 {{ filteredList.length }} 个结果
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
    gap: 8px;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-item {
    padding: 12px;
  }
}
</style>
