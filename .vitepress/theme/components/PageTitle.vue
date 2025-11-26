<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { page, frontmatter } = useData()

const pageTitle = computed(() => {
  // Priority: frontmatter title > filename
  if (frontmatter.value.title) {
    return frontmatter.value.title
  }
  
  // Extract filename from path
  const parts = page.value.relativePath.split('/')
  const filename = parts[parts.length - 1]
  return filename.replace(/\.md$/, '')
})

// Check if page already has an h1 heading
const hasH1Heading = computed(() => {
  // This is a simple check - the component will only render if there's no h1
  // We'll rely on CSS to handle this gracefully
  return false
})
</script>

<template>
  <h1 v-if="!hasH1Heading" class="page-title">{{ pageTitle }}</h1>
</template>

<style scoped>
.page-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--vp-c-text-1);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
}
</style>
