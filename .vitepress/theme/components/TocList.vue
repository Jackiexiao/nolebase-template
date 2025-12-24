<!-- 目录 -->
<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
const isSortMenuOpen = ref(false)
const sortActiveIndex = ref(-1)
const sortRoot = ref<HTMLElement | null>(null)
let docPointerDownHandler: ((event: Event) => void) | null = null

const sortOptions = [
  { value: 'name-asc', label: '文件名 (A-Z)' },
  { value: 'name-desc', label: '文件名 (Z-A)' },
  { value: 'updated-desc', label: '编辑时间 (从新到旧)' },
  { value: 'updated-asc', label: '编辑时间 (从旧到新)' },
  { value: 'created-desc', label: '创建时间 (从新到旧)' },
  { value: 'created-asc', label: '创建时间 (从旧到新)' },
] as const satisfies ReadonlyArray<{ value: SortOption, label: string }>

const currentSortLabel = computed(() => {
  return sortOptions.find(option => option.value === currentSort.value)?.label || '选择排序方式'
})

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

function openSortMenu() {
  isSortMenuOpen.value = true
  sortActiveIndex.value = sortOptions.findIndex(option => option.value === currentSort.value)
}

function closeSortMenu() {
  isSortMenuOpen.value = false
  sortActiveIndex.value = -1
}

function toggleSortMenu() {
  if (isSortMenuOpen.value) closeSortMenu()
  else openSortMenu()
}

function selectSort(value: SortOption) {
  handleSortChange(value)
  closeSortMenu()
}

function handleSortTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleSortMenu()
    return
  }

  if (event.key === 'Escape') {
    if (isSortMenuOpen.value) {
      event.preventDefault()
      closeSortMenu()
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isSortMenuOpen.value) openSortMenu()
    sortActiveIndex.value = Math.min(sortOptions.length - 1, Math.max(0, sortActiveIndex.value + 1))
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isSortMenuOpen.value) openSortMenu()
    sortActiveIndex.value = Math.max(0, sortActiveIndex.value === -1 ? sortOptions.length - 1 : sortActiveIndex.value - 1)
  }
}

function handleSortMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeSortMenu()
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (sortActiveIndex.value >= 0 && sortActiveIndex.value < sortOptions.length) {
      event.preventDefault()
      selectSort(sortOptions[sortActiveIndex.value].value)
    }
  }
}

onMounted(() => {
  if (typeof document === 'undefined') return
  docPointerDownHandler = (event: Event) => {
    const target = event.target as Node | null
    if (!target) return
    if (!sortRoot.value?.contains(target)) closeSortMenu()
  }
  document.addEventListener('pointerdown', docPointerDownHandler, true)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  if (!docPointerDownHandler) return
  document.removeEventListener('pointerdown', docPointerDownHandler, true)
  docPointerDownHandler = null
})
</script>

<template>
  <div class="toc-container">
    <CalendarFilter :items="list" @filter="handleFilter" />
    
    <div class="filter-results">
      <div class="results-header">
        <h2 class="results-title">最近更新</h2>
        <div class="results-actions">
          <div ref="sortRoot" class="sort-dropdown">
            <button
              class="sort-trigger"
              type="button"
              :aria-expanded="isSortMenuOpen ? 'true' : 'false'"
              aria-haspopup="listbox"
              aria-label="排序方式"
              @click="toggleSortMenu"
              @keydown="handleSortTriggerKeydown"
            >
              <span class="sort-trigger-text">{{ currentSortLabel }}</span>
              <span class="sort-trigger-chevron" :data-open="isSortMenuOpen ? 'true' : 'false'" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </button>

            <Transition name="sort-pop">
              <div v-show="isSortMenuOpen" class="sort-menu" role="listbox" tabindex="-1" @keydown="handleSortMenuKeydown">
                <button
                  v-for="(option, index) in sortOptions"
                  :key="option.value"
                  class="sort-option"
                  type="button"
                  role="option"
                  :aria-selected="option.value === currentSort ? 'true' : 'false'"
                  :data-active="index === sortActiveIndex ? 'true' : 'false'"
                  @mouseenter="sortActiveIndex = index"
                  @click="selectSort(option.value)"
                >
                  <span class="sort-option-label">{{ option.label }}</span>
                  <span v-if="option.value === currentSort" class="sort-option-check" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </Transition>
          </div>
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
            <div v-if="item.created" class="meta-item">
              <span class="i-octicon:calendar-16 align-middle text-xs" />
              <span class="align-middle">
                创建时间：{{ new Date(item.created).toLocaleDateString() }}
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

.sort-dropdown {
  position: relative;
}

.sort-trigger {
  width: 220px;
  padding: 7px 10px 7px 12px;
  border: 1px solid color-mix(in oklab, var(--vp-c-brand-1) 10%, var(--dash-line));
  border-radius: 10px;
  background:
    radial-gradient(400px 200px at 10% 0%, color-mix(in oklab, var(--dash-accent-b) 10%, transparent), transparent 70%),
    radial-gradient(400px 200px at 90% 0%, color-mix(in oklab, var(--dash-accent-a) 10%, transparent), transparent 72%),
    color-mix(in oklab, var(--vp-c-bg) 52%, transparent);
  backdrop-filter: blur(14px);
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sort-trigger:hover {
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 55%, var(--dash-line));
  box-shadow: 0 18px 48px color-mix(in oklab, var(--vp-c-brand-1) 14%, transparent);
}

.sort-trigger:active {
  transform: translateY(1px);
}

.sort-trigger:focus-visible {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--vp-c-brand-1) 20%, transparent);
}

.sort-trigger-text {
  text-align: left;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: color-mix(in oklab, var(--vp-c-text-1) 92%, transparent);
}

.sort-trigger-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 9px;
  color: var(--vp-c-text-2);
  background: color-mix(in oklab, var(--vp-c-bg) 30%, transparent);
  border: 1px solid color-mix(in oklab, var(--dash-line) 60%, transparent);
  transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.sort-trigger:hover .sort-trigger-chevron {
  color: var(--vp-c-brand-1);
  background: color-mix(in oklab, var(--vp-c-bg) 44%, transparent);
}

.sort-trigger-chevron[data-open="true"] {
  transform: rotate(180deg);
}

.sort-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 280px;
  max-width: min(72vw, 320px);
  border-radius: 14px;
  padding: 6px;
  border: 1px solid color-mix(in oklab, var(--vp-c-brand-1) 12%, var(--dash-line));
  background:
    radial-gradient(520px 220px at 16% 0%, color-mix(in oklab, var(--dash-accent-b) 14%, transparent), transparent 70%),
    radial-gradient(520px 220px at 86% 0%, color-mix(in oklab, var(--dash-accent-a) 12%, transparent), transparent 72%),
    color-mix(in oklab, var(--vp-c-bg) 62%, transparent);
  backdrop-filter: blur(16px);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.18);
  max-height: min(280px, calc(100vh - 220px));
  overflow: auto;
  z-index: 10;
}

.sort-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease, color 160ms ease;
}

.sort-option:hover,
.sort-option[data-active="true"] {
  background: color-mix(in oklab, var(--vp-c-bg) 40%, transparent);
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 12%, transparent);
}

.sort-option:active {
  transform: translateY(1px);
}

.sort-option[aria-selected="true"] {
  background: color-mix(in oklab, var(--vp-c-brand-soft) 50%, transparent);
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 24%, transparent);
}

.sort-option-label {
  min-width: 0;
  text-align: left;
}

.sort-option-check {
  color: var(--vp-c-brand-1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--vp-c-bg) 34%, transparent);
  border: 1px solid color-mix(in oklab, var(--vp-c-brand-1) 16%, transparent);
}

.sort-pop-enter-active,
.sort-pop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease, filter 160ms ease;
}

.sort-pop-enter-from,
.sort-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
  filter: blur(6px);
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
  
  .sort-trigger {
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
</style>
