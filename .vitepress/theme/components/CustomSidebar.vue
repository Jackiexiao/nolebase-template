<!-- 自定义可排序侧边栏主组件 -->
<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { sidebar } from '../../docsMetadata.json'
import type { ArticleTree } from '../../../scripts/types/metadata'
import CustomSidebarItem from './CustomSidebarItem.vue'

// 排序选项类型
type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

// 当前排序方式，默认按文件名升序（保持原有行为）
const currentSort = ref<SortOption>('name-asc')
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
  currentSort.value = value
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

// 组件挂载时，从 localStorage 读取偏好
onMounted(() => {
  const savedPreference = localStorage.getItem('sidebar-sort-preference') as SortOption | null
  if (savedPreference) {
    currentSort.value = savedPreference
  }

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
  <aside class="custom-sidebar">
    <!-- 排序控制器 - 固定在顶部 -->
    <div ref="sortRoot" class="sidebar-sort-control">
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
      <div class="sort-dropdown">
        <button
          class="sort-trigger"
          type="button"
          :aria-expanded="isSortMenuOpen ? 'true' : 'false'"
          aria-haspopup="listbox"
          aria-label="侧边栏排序方式"
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
  background: transparent;
  display: flex;
  flex-direction: column;
}

.sidebar-sort-control {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: transparent;
  border-bottom: 1px solid color-mix(in oklab, var(--vp-c-brand-1) 12%, var(--dash-line));
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

.sort-dropdown {
  position: relative;
}

.sort-trigger {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid color-mix(in oklab, var(--vp-c-brand-1) 10%, var(--dash-line));
  border-radius: 6px;
  background-color: color-mix(in oklab, var(--vp-c-bg) 40%, transparent);
  backdrop-filter: blur(10px);
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
  border-color: var(--vp-c-brand-1);
  background-color: color-mix(in oklab, var(--vp-c-bg) 52%, transparent);
  box-shadow: 0 10px 22px color-mix(in oklab, var(--vp-c-brand-1) 14%, transparent);
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
  width: 22px;
  height: 22px;
  border-radius: 6px;
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
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid color-mix(in oklab, var(--vp-c-brand-1) 10%, var(--dash-line));
  background:
    radial-gradient(520px 220px at 16% 0%, color-mix(in oklab, var(--dash-accent-b) 14%, transparent), transparent 70%),
    radial-gradient(520px 220px at 86% 0%, color-mix(in oklab, var(--dash-accent-a) 12%, transparent), transparent 72%),
    color-mix(in oklab, var(--vp-c-bg) 54%, transparent);
  backdrop-filter: blur(16px);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.18);
  max-height: min(240px, calc(100vh - 140px));
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
  border-radius: 10px;
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
  background: color-mix(in oklab, var(--vp-c-bg) 38%, transparent);
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 12%, transparent);
}

.sort-option:active {
  transform: translateY(1px);
}

.sort-option[aria-selected="true"] {
  background: color-mix(in oklab, var(--vp-c-brand-soft) 50%, transparent);
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 22%, transparent);
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
  width: 22px;
  height: 22px;
  border-radius: 8px;
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
  background: color-mix(in oklab, var(--vp-c-brand-1) 22%, var(--vp-c-divider));
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: color-mix(in oklab, var(--vp-c-brand-1) 36%, var(--vp-c-divider));
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
