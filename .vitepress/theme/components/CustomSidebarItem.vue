<!-- 自定义侧边栏项组件（递归） -->
<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vitepress'
import type { ArticleTree } from '../../../scripts/types/metadata'

interface Props {
  item: ArticleTree
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})

const route = useRoute()
const isCollapsed = ref(props.item.collapsed ?? true)
const closeScreen = inject<() => void>('close-screen', () => {})

// 检查是否有子项
const hasChildren = computed(() => {
  return props.item.items && props.item.items.length > 0
})

// 检查当前项是否激活（当前页面）
const isActive = computed(() => {
  if (!props.item.link) return false
  return route.path === props.item.link || route.path === `${props.item.link}.html`
})

// 检查子项中是否有激活项
const hasActiveChild = computed(() => {
  if (!hasChildren.value) return false
  return checkHasActiveChild(props.item.items!)
})

function checkHasActiveChild(items: ArticleTree[]): boolean {
  for (const item of items) {
    if (item.link && (route.path === item.link || route.path === `${item.link}.html`)) {
      return true
    }
    if (item.items && checkHasActiveChild(item.items)) {
      return true
    }
  }
  return false
}

// 切换折叠状态
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

// 缩进样式
const indentStyle = computed(() => ({
  paddingLeft: `${props.depth * 12 + 12}px`
}))

function handleNavigate() {
  closeScreen()
}
</script>

<template>
  <div class="sidebar-item">
    <!-- 如果有子项，显示为可折叠的组 -->
    <div
      v-if="hasChildren"
      class="sidebar-group"
      :class="{ 'is-active': hasActiveChild, 'is-collapsed': isCollapsed }"
    >
      <button
        class="group-title"
        :style="indentStyle"
        @click="toggleCollapse"
        :aria-expanded="!isCollapsed"
      >
        <span class="collapse-icon" :class="{ 'is-collapsed': isCollapsed }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="title-text">{{ item.text }}</span>
      </button>

      <!-- 递归渲染子项 -->
      <div v-if="!isCollapsed" class="group-items">
        <CustomSidebarItem
          v-for="(childItem, index) in item.items"
          :key="index"
          :item="childItem"
          :depth="depth + 1"
        />
      </div>
    </div>

    <!-- 如果是叶子节点且有链接，显示为链接 -->
    <a
      v-else-if="item.link"
      :href="item.link"
      class="sidebar-link"
      :class="{ 'is-active': isActive }"
      :style="indentStyle"
      @click="handleNavigate"
    >
      <span class="link-text">{{ item.text }}</span>
    </a>

    <!-- 如果既没有子项也没有链接，显示为纯文本 -->
    <div
      v-else
      class="sidebar-text"
      :style="indentStyle"
    >
      <span class="text-content">{{ item.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.sidebar-item {
  position: relative;
}

.sidebar-group {
  margin: 2px 0;
}

.group-title {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  user-select: none;
}

.group-title:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}

.collapse-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: var(--vp-c-text-3);
  transition: transform 0.25s, color 0.25s;
  transform: rotate(90deg); /* 展开时向下 */
}

.collapse-icon.is-collapsed {
  transform: rotate(0deg); /* 折叠时向右 */
}

.group-title:hover .collapse-icon {
  color: var(--vp-c-brand-1);
}

.title-text {
  flex: 1;
  line-height: 20px;
}

.group-items {
  margin: 4px 0;
  padding: 2px 0 2px 0;
}

.sidebar-link {
  display: block;
  padding: 6px 10px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
  border-radius: 8px;
  margin: 2px 0;
}

.sidebar-link:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}

.sidebar-link.is-active {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  background-color: var(--vp-c-bg-soft);
  box-shadow: inset 2px 0 0 0 var(--vp-c-brand-1);
}

.link-text {
  line-height: 20px;
}

.sidebar-text {
  padding: 6px 10px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  border-radius: 8px;
}

.text-content {
  opacity: 0.7;
}

/* 当前分组下包含激活项时的强调 */
.sidebar-group.is-active > .group-title {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
  box-shadow: inset 2px 0 0 0 var(--vp-c-brand-1);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .group-title,
  .sidebar-link,
  .sidebar-text {
    font-size: 15px;
  }
}
</style>
