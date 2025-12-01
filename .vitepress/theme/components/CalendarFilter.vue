<!-- 日历筛选组件 -->
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import type { ArticleTree } from '../../../scripts/types/metadata'

// 定义组件属性
interface Props {
  items: ArticleTree[] // 所有文章列表
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  filter: [filteredItems: ArticleTree[]] // 筛选后的事件
}>()

// 状态变量
const currentDate = new Date()
const currentYear = ref(currentDate.getFullYear())
const currentMonth = ref(currentDate.getMonth())
const selectedStartDate = ref<Date | null>(null)
const selectedEndDate = ref<Date | null>(null)
const isSelectingRange = ref(false)
const hoveredDate = ref<Date | null>(null)
const isCalendarExpanded = ref(false) // 控制日历折叠状态，默认折叠

// 预设的可访问性良好的颜色库
const markerColors = [
  '#3b82f6', // 蓝色
  '#10b981', // 绿色
  '#f59e0b', // 橙色
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#14b8a6', // 青色
  '#f97316', // 深橙色
]

// 获取有更新内容的日期及其对应的随机颜色
const datesWithUpdates = computed(() => {
  const dateMap = new Map<string, { count: number, color: string }>()
  
  props.items.forEach(item => {
    if (item.created) {
      const date = new Date(item.created)
      const dateKey = formatDateKey(date)
      
      if (!dateMap.has(dateKey)) {
        // 为每个日期分配一个随机颜色
        const randomColor = markerColors[Math.floor(Math.random() * markerColors.length)]
        dateMap.set(dateKey, { count: 0, color: randomColor })
      }
      
      dateMap.get(dateKey)!.count++
    }
  })
  
  return dateMap
})

// 格式化日期为键值 (YYYY-MM-DD)
function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取本周的日期（用于折叠状态显示）
const getRecentUpdateDates = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = 周日, 1 = 周一, ..., 6 = 周六
  
  // 计算本周日（周的开始）
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const weekDates = []
  
  // 从周日到今天
  for (let i = 0; i <= dayOfWeek; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    weekDates.push({
      day: date.getDate(),
      date: date
    })
  }
  
  return weekDates
}

// 获取当前月份的日期信息
const currentMonthDates = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)
  
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const daysInPrevMonth = prevLastDay.getDate()
  
  const dates = []
  
  // 上个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    dates.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(currentYear.value, currentMonth.value - 1, daysInPrevMonth - i)
    })
  }
  
  // 当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear.value, currentMonth.value, i)
    })
  }
  
  // 下个月的日期
  const remainingDays = 42 - dates.length // 6周 * 7天
  for (let i = 1; i <= remainingDays; i++) {
    dates.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear.value, currentMonth.value + 1, i)
    })
  }
  
  return dates
})

// 判断日期是否在选中范围内
const isDateInRange = (date: Date): boolean => {
  if (!selectedStartDate.value) return false
  
  const dateKey = formatDateKey(date)
  const startKey = formatDateKey(selectedStartDate.value)
  
  // 如果只选中了开始日期（单个日期），则高亮显示该日期
  if (!selectedEndDate.value) {
    return dateKey === startKey
  }
  
  // 如果选中了日期范围，则高亮显示范围内的所有日期
  const endKey = formatDateKey(selectedEndDate.value)
  return dateKey >= startKey && dateKey <= endKey
}

// 判断日期是否是选中范围的开始或结束
const isDateRangeBoundary = (date: Date): 'start' | 'end' | 'both' | false => {
  if (!selectedStartDate.value) return false
  
  const dateKey = formatDateKey(date)
  const startKey = formatDateKey(selectedStartDate.value)
  
  // 如果只选中了开始日期（单个日期），则它既是开始也是结束
  if (!selectedEndDate.value) {
    if (dateKey === startKey) return 'both'
    return false
  }
  
  if (dateKey === startKey) return 'start'
  
  if (selectedEndDate.value) {
    const endKey = formatDateKey(selectedEndDate.value)
    if (dateKey === endKey) return 'end'
  }
  
  return false
}

// 判断日期是否在悬停范围内
const isDateInHoverRange = (date: Date): boolean => {
  if (!isSelectingRange.value || !selectedStartDate.value || !hoveredDate.value) return false
  
  const dateKey = formatDateKey(date)
  const startKey = formatDateKey(selectedStartDate.value)
  const hoverKey = formatDateKey(hoveredDate.value)
  
  return dateKey >= startKey && dateKey <= hoverKey
}

// 处理日期点击
const handleDateClick = (date: Date) => {
  const dateKey = formatDateKey(date)
  
  // 如果点击的是已选中的开始日期，取消选中
  if (selectedStartDate.value && formatDateKey(selectedStartDate.value) === dateKey) {
    selectedStartDate.value = null
    selectedEndDate.value = null
    isSelectingRange.value = false
    return
  }
  
  // 如果点击的是已选中的结束日期，取消选中
  if (selectedEndDate.value && formatDateKey(selectedEndDate.value) === dateKey) {
    selectedEndDate.value = null
    isSelectingRange.value = true
    return
  }
  
  if (!isSelectingRange.value) {
    // 开始选择范围
    selectedStartDate.value = date
    selectedEndDate.value = null
    isSelectingRange.value = true
  } else {
    // 完成范围选择
    if (date < selectedStartDate.value) {
      // 如果点击的日期早于开始日期，交换它们
      selectedEndDate.value = selectedStartDate.value
      selectedStartDate.value = date
    } else {
      selectedEndDate.value = date
    }
    isSelectingRange.value = false
  }
}

// 处理日期悬停
const handleDateHover = (date: Date) => {
  if (isSelectingRange.value) {
    hoveredDate.value = date
  }
}

// 切换到上一个月
const goToPrevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 切换到下一个月
const goToNextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 重置筛选
const resetFilter = () => {
  selectedStartDate.value = null
  selectedEndDate.value = null
  isSelectingRange.value = false
  hoveredDate.value = null
}

// 监听选中日期变化，触发筛选
watch([selectedStartDate, selectedEndDate], () => {
  if (!selectedStartDate.value) {
    emit('filter', props.items)
    return
  }
  
  const filtered = props.items.filter(item => {
    if (!item.lastUpdated) return false
    
    const itemDate = new Date(item.created)
    const itemDateKey = formatDateKey(itemDate)
    const startKey = formatDateKey(selectedStartDate.value!)
    
    if (!selectedEndDate.value) {
      // 单日期筛选
      return itemDateKey === startKey
    } else {
      // 日期范围筛选
      const endKey = formatDateKey(selectedEndDate.value)
      return itemDateKey >= startKey && itemDateKey <= endKey
    }
  })
  
  emit('filter', filtered)
})

// 格式化月份显示
const formatMonthYear = computed(() => {
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]
  return `${currentYear.value}年 ${monthNames[currentMonth.value]}`
})

// 格式化选中的日期范围显示
const selectedRangeDisplay = computed(() => {
  if (!selectedStartDate.value) return ''
  
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  if (!selectedEndDate.value) {
    return formatDate(selectedStartDate.value)
  }
  
  return `${formatDate(selectedStartDate.value)} 至 ${formatDate(selectedEndDate.value)}`
})

// 初始化时触发一次筛选
onMounted(() => {
  emit('filter', props.items)
})
</script>

<template>
  <div class="calendar-filter">
    <div class="calendar-header">
      <h2 class="calendar-title">日历筛选</h2>
      <div class="header-actions">
        <div class="month-navigation">
          <button class="nav-button" @click="goToPrevMonth" aria-label="上个月">
            <span class="i-octicon:chevron-left-12"></span>
          </button>
          <div class="current-month">{{ formatMonthYear }}</div>
          <button class="nav-button" @click="goToNextMonth" aria-label="下个月">
            <span class="i-octicon:chevron-right-12"></span>
          </button>
        </div>
        <button 
          class="toggle-button" 
          @click="isCalendarExpanded = !isCalendarExpanded" 
          :aria-label="isCalendarExpanded ? '折叠日历' : '展开日历'"
        >
          <span :class="isCalendarExpanded ? 'i-octicon:chevron-up-12' : 'i-octicon:chevron-down-12'"></span>
        </button>
      </div>
    </div>
    
    <div class="calendar-content" :class="{ 'collapsed': !isCalendarExpanded }">
      <!-- 折叠状态下显示当前周的日期 -->
      <div class="collapsed-dates">
        <div
          v-for="(dateInfo, index) in getRecentUpdateDates()"
          :key="index"
          class="collapsed-date"
          :class="{
            'selected': isDateInRange(dateInfo.date),
            'range-start': isDateRangeBoundary(dateInfo.date) === 'start' || isDateRangeBoundary(dateInfo.date) === 'both',
            'range-end': isDateRangeBoundary(dateInfo.date) === 'end' || isDateRangeBoundary(dateInfo.date) === 'both',
            'in-range': isDateInRange(dateInfo.date) && isDateRangeBoundary(dateInfo.date) === false
          }"
          @click="handleDateClick(dateInfo.date)"
        >
          <span class="collapsed-day-number">{{ dateInfo.day }}</span>
          <div
            v-if="datesWithUpdates.has(formatDateKey(dateInfo.date))"
            class="collapsed-update-marker"
            :style="{ backgroundColor: datesWithUpdates.get(formatDateKey(dateInfo.date))?.color }"
          ></div>
        </div>
      </div>
      
      <!-- 展开状态下的完整日历 -->
      <div class="expanded-calendar-view">
        <div class="calendar-weekdays">
          <div class="weekday" v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">
            {{ day }}
          </div>
        </div>
        
        <div class="calendar-days">
          <div
            v-for="(dateInfo, index) in currentMonthDates"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': !dateInfo.isCurrentMonth,
              'selected': isDateInRange(dateInfo.date),
              'range-start': isDateRangeBoundary(dateInfo.date) === 'start' || isDateRangeBoundary(dateInfo.date) === 'both',
              'range-end': isDateRangeBoundary(dateInfo.date) === 'end' || isDateRangeBoundary(dateInfo.date) === 'both',
              'in-range': isDateInRange(dateInfo.date) && isDateRangeBoundary(dateInfo.date) === false,
              'hover-range': isDateInHoverRange(dateInfo.date),
              'selecting': isSelectingRange
            }"
            @click="handleDateClick(dateInfo.date)"
            @mouseenter="handleDateHover(dateInfo.date)"
          >
            <span class="day-number">{{ dateInfo.day }}</span>
            <div
              v-if="datesWithUpdates.has(formatDateKey(dateInfo.date))"
              class="update-marker"
              :style="{ backgroundColor: datesWithUpdates.get(formatDateKey(dateInfo.date))?.color }"
              :title="`${datesWithUpdates.get(formatDateKey(dateInfo.date))?.count} 个更新`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="filter-status">
      <div v-if="selectedRangeDisplay" class="selected-range">
        <span class="i-octicon:filter-16"></span>
        <span>筛选日期: {{ selectedRangeDisplay }}</span>
        <button class="reset-button" @click="resetFilter" aria-label="重置筛选">
          <span class="i-octicon:x-16"></span>
        </button>
      </div>
      <div v-else class="filter-hint">
        <span class="i-octicon:info-16"></span>
        <span>点击日期开始筛选，再次点击完成范围选择</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-filter {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: var(--vp-shadow-1);
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: var(--vp-c-bg-mute);
}

.current-month {
  font-weight: 500;
  color: var(--vp-c-text-1);
  min-width: 120px;
  text-align: center;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: var(--vp-c-bg-mute);
}

/* 动画相关样式 */
.calendar-content {
  position: relative;
  overflow: hidden;
  max-height: 500px; /* 展开时的最大高度 */
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-content.collapsed {
  max-height: 72px; /* 折叠时的高度，增加以容纳滚动条 */
}

/* 折叠状态下的日期行 */
.collapsed-dates {
  display: flex;
  gap: 4px;
  padding: 4px 0 12px 0; /* 增加底部padding给滚动条留出空间 */
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  
  /* 绝对定位以实现淡入淡出效果 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  
  /* 过渡效果 */
  opacity: 0;
  pointer-events: none;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.calendar-content.collapsed .collapsed-dates {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.collapsed-dates::-webkit-scrollbar {
  height: 4px;
}

.collapsed-dates::-webkit-scrollbar-thumb {
  background-color: var(--vp-c-divider);
  border-radius: 2px;
}

.collapsed-date {
  position: relative;
  min-width: 40px;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  flex-shrink: 0;
}

.collapsed-date:hover {
  background-color: var(--vp-c-bg-soft);
}

.collapsed-date.selected {
  background-color: var(--vp-c-brand);
  color: white;
}

.collapsed-date.range-start {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.collapsed-date.range-end {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.collapsed-date.in-range {
  background-color: var(--vp-c-brand-soft);
}

.collapsed-day-number {
  font-size: 14px;
  line-height: 1;
}

.collapsed-update-marker {
  position: absolute;
  bottom: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 展开状态下的完整日历 */
.expanded-calendar-view {
  /* 过渡效果 */
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
  transform-origin: top;
}

.calendar-content.collapsed .expanded-calendar-view {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-10px);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 8px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.calendar-day:hover {
  background-color: var(--vp-c-bg-soft);
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.selected {
  background-color: var(--vp-c-brand);
  color: white;
}

.calendar-day.range-start {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.calendar-day.range-end {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.calendar-day.in-range {
  background-color: var(--vp-c-brand-soft);
}

.calendar-day.hover-range {
  background-color: var(--vp-c-bg-mute);
}

.day-number {
  font-size: 14px;
  line-height: 1;
}

.update-marker {
  position: absolute;
  bottom: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.filter-status {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-border);
}

.selected-range, .filter-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.reset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: var(--vp-c-bg-soft);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-filter {
    max-width: 100%;
    padding: 12px;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .calendar-title {
    align-self: flex-start;
  }
  
  .weekday {
    font-size: 11px;
    padding: 6px 0;
  }
  
  .day-number {
    font-size: 12px;
  }
  
  .update-marker {
    width: 4px;
    height: 4px;
    bottom: 2px;
  }
}

/* 暗色模式适配 */
html.dark .calendar-filter {
  box-shadow: var(--vp-shadow-1);
}

html.dark .nav-button:hover {
  background-color: var(--vp-c-bg-mute);
}

html.dark .calendar-day:hover {
  background-color: var(--vp-c-bg-mute);
}
</style>
