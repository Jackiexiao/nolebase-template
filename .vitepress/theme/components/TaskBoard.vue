<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

type TaskStatus = 'todo' | 'doing' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'
type TaskView = 'timeline' | 'board'

type Task = {
  id: string
  title: string
  note: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
  updatedAt: string
}

type StoredPayloadV1 = {
  version: 1
  updatedAt: number
  tasks: Task[]
}

const STORAGE_KEY = 'dash:task-board:v1'

const isClient = ref(false)
const loadError = ref('')

const view = ref<TaskView>('timeline')
const search = ref('')
const statusFilter = ref<TaskStatus | 'all'>('all')
const showDone = ref(true)

const statusRoot = ref<HTMLElement | null>(null)
const statusMenuEl = ref<HTMLElement | null>(null)
const statusTriggerEl = ref<HTMLButtonElement | null>(null)
const isStatusMenuOpen = ref(false)
const statusActiveIndex = ref(-1)
const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待办' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
] as const

const modalStatusRoot = ref<HTMLElement | null>(null)
const modalStatusMenuEl = ref<HTMLElement | null>(null)
const modalStatusTriggerEl = ref<HTMLButtonElement | null>(null)
const isModalStatusMenuOpen = ref(false)
const modalStatusActiveIndex = ref(-1)
const modalStatusOptions = [
  { value: 'todo', label: '待办' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
] as const

const modalPriorityRoot = ref<HTMLElement | null>(null)
const modalPriorityMenuEl = ref<HTMLElement | null>(null)
const modalPriorityTriggerEl = ref<HTMLButtonElement | null>(null)
const isModalPriorityMenuOpen = ref(false)
const modalPriorityActiveIndex = ref(-1)
const modalPriorityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
] as const

const tasks = ref<Task[]>([])

const isEditorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<string>('')
const editor = reactive({
  title: '',
  note: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  dueDate: '' as string,
})

const dragTaskId = ref<string>('')
const dueDateInputEl = ref<HTMLInputElement | null>(null)

const counts = computed(() => {
  const acc = { all: 0, todo: 0, doing: 0, done: 0 }
  for (const task of tasks.value) {
    acc.all += 1
    acc[task.status] += 1
  }
  return acc
})

const currentStatusLabel = computed(() => {
  return statusOptions.find(option => option.value === statusFilter.value)?.label || '全部'
})

const modalStatusLabel = computed(() => {
  return modalStatusOptions.find(option => option.value === editor.status)?.label || '待办'
})

const modalPriorityLabel = computed(() => {
  return modalPriorityOptions.find(option => option.value === editor.priority)?.label || '中'
})

function focusMenu(el?: HTMLElement | null) {
  if (!el) return
  try {
    el.focus({ preventScroll: true })
  }
  catch {
    el.focus()
  }
}

function nowIso() {
  return new Date().toISOString()
}

function safeParseJson(raw: string) {
  try {
    return JSON.parse(raw)
  }
  catch {
    return null
  }
}

function normalizeTask(value: any): Task | null {
  if (!value || typeof value !== 'object') return null

  const id = typeof value.id === 'string' ? value.id : ''
  const title = typeof value.title === 'string' ? value.title : ''
  const note = typeof value.note === 'string' ? value.note : ''
  const status: TaskStatus = value.status === 'doing' || value.status === 'done' ? value.status : 'todo'
  const priority: TaskPriority = value.priority === 'low' || value.priority === 'high' ? value.priority : 'medium'

  const createdAt = typeof value.createdAt === 'string' ? value.createdAt : nowIso()
  const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : createdAt
  const dueDate = typeof value.dueDate === 'string' && value.dueDate ? value.dueDate : undefined

  if (!id || !title.trim()) return null

  return {
    id,
    title: title.trim(),
    note,
    status,
    priority,
    dueDate,
    createdAt,
    updatedAt,
  }
}

function readStorage(): Task[] {
  if (typeof localStorage === 'undefined') return []

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  const parsed = safeParseJson(raw) as StoredPayloadV1 | null
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tasks)) return []

  const normalized: Task[] = []
  for (const item of parsed.tasks) {
    const task = normalizeTask(item)
    if (task) normalized.push(task)
  }
  return normalized
}

function writeStorage(nextTasks: Task[]) {
  if (typeof localStorage === 'undefined') return

  const payload: StoredPayloadV1 = {
    version: 1,
    updatedAt: Date.now(),
    tasks: nextTasks,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }
  catch {
    // ignore quota/security errors
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    return crypto.randomUUID()
  return `t_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function formatDayLabel(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  return formatter.format(date)
}

function formatTimeLabel(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return formatter.format(date)
}

const filteredTasks = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return tasks.value
    .filter((task) => {
      if (!showDone.value && task.status === 'done') return false
      if (statusFilter.value !== 'all' && task.status !== statusFilter.value) return false
      if (!keyword) return true
      return `${task.title}\n${task.note}`.toLowerCase().includes(keyword)
    })
})

const timelineGroups = computed(() => {
  const sorted = [...filteredTasks.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const groups: Array<{ dayKey: string, dayLabel: string, items: Task[] }> = []

  for (const task of sorted) {
    const dayKey = task.createdAt.slice(0, 10)
    const last = groups.at(-1)
    if (!last || last.dayKey !== dayKey) {
      groups.push({
        dayKey,
        dayLabel: formatDayLabel(task.createdAt),
        items: [task],
      })
    }
    else {
      last.items.push(task)
    }
  }

  return groups
})

const boardColumns = computed(() => {
  const sorted = [...filteredTasks.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const columns: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
  for (const task of sorted)
    columns[task.status].push(task)
  return columns
})

function openStatusMenu() {
  isStatusMenuOpen.value = true
  statusActiveIndex.value = Math.max(0, statusOptions.findIndex(option => option.value === statusFilter.value))
  nextTick(() => focusMenu(statusMenuEl.value))
}

function closeStatusMenu({ focusTrigger = false }: { focusTrigger?: boolean } = {}) {
  isStatusMenuOpen.value = false
  statusActiveIndex.value = -1
  if (focusTrigger)
    nextTick(() => statusTriggerEl.value?.focus?.())
}

function toggleStatusMenu() {
  if (isStatusMenuOpen.value)
    closeStatusMenu()
  else
    openStatusMenu()
}

function selectStatus(value: typeof statusOptions[number]['value']) {
  statusFilter.value = value as any
  closeStatusMenu({ focusTrigger: true })
}

function handleStatusTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isStatusMenuOpen.value) {
    event.preventDefault()
    closeStatusMenu({ focusTrigger: true })
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleStatusMenu()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openStatusMenu()
    const currentIndex = statusOptions.findIndex(option => option.value === statusFilter.value)
    if (event.key === 'ArrowDown')
      statusActiveIndex.value = Math.min(statusOptions.length - 1, Math.max(0, currentIndex) + 1)
    else
      statusActiveIndex.value = Math.max(0, (currentIndex >= 0 ? currentIndex : 0) - 1)
  }
}

function handleStatusMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeStatusMenu({ focusTrigger: true })
    return
  }

  if (event.key === 'Tab') {
    closeStatusMenu()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const next = statusActiveIndex.value + delta
    if (next < 0)
      statusActiveIndex.value = statusOptions.length - 1
    else if (next >= statusOptions.length)
      statusActiveIndex.value = 0
    else
      statusActiveIndex.value = next
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (statusActiveIndex.value >= 0 && statusActiveIndex.value < statusOptions.length) {
      event.preventDefault()
      selectStatus(statusOptions[statusActiveIndex.value].value)
    }
  }
}

function openModalStatusMenu() {
  isModalStatusMenuOpen.value = true
  isModalPriorityMenuOpen.value = false
  modalStatusActiveIndex.value = Math.max(0, modalStatusOptions.findIndex(option => option.value === editor.status))
  nextTick(() => focusMenu(modalStatusMenuEl.value))
}

function closeModalStatusMenu({ focusTrigger = false }: { focusTrigger?: boolean } = {}) {
  isModalStatusMenuOpen.value = false
  modalStatusActiveIndex.value = -1
  if (focusTrigger)
    nextTick(() => modalStatusTriggerEl.value?.focus?.())
}

function toggleModalStatusMenu() {
  if (isModalStatusMenuOpen.value)
    closeModalStatusMenu()
  else
    openModalStatusMenu()
}

function selectModalStatus(value: typeof modalStatusOptions[number]['value']) {
  editor.status = value as TaskStatus
  closeModalStatusMenu({ focusTrigger: true })
}

function handleModalStatusTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isModalStatusMenuOpen.value) {
    event.preventDefault()
    closeModalStatusMenu({ focusTrigger: true })
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleModalStatusMenu()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openModalStatusMenu()
    const currentIndex = modalStatusOptions.findIndex(option => option.value === editor.status)
    if (event.key === 'ArrowDown')
      modalStatusActiveIndex.value = Math.min(modalStatusOptions.length - 1, Math.max(0, currentIndex) + 1)
    else
      modalStatusActiveIndex.value = Math.max(0, (currentIndex >= 0 ? currentIndex : 0) - 1)
  }
}

function handleModalStatusMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeModalStatusMenu({ focusTrigger: true })
    return
  }

  if (event.key === 'Tab') {
    closeModalStatusMenu()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const next = modalStatusActiveIndex.value + delta
    if (next < 0)
      modalStatusActiveIndex.value = modalStatusOptions.length - 1
    else if (next >= modalStatusOptions.length)
      modalStatusActiveIndex.value = 0
    else
      modalStatusActiveIndex.value = next
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (modalStatusActiveIndex.value >= 0 && modalStatusActiveIndex.value < modalStatusOptions.length) {
      event.preventDefault()
      selectModalStatus(modalStatusOptions[modalStatusActiveIndex.value].value)
    }
  }
}

function openModalPriorityMenu() {
  isModalPriorityMenuOpen.value = true
  isModalStatusMenuOpen.value = false
  modalPriorityActiveIndex.value = Math.max(0, modalPriorityOptions.findIndex(option => option.value === editor.priority))
  nextTick(() => focusMenu(modalPriorityMenuEl.value))
}

function closeModalPriorityMenu({ focusTrigger = false }: { focusTrigger?: boolean } = {}) {
  isModalPriorityMenuOpen.value = false
  modalPriorityActiveIndex.value = -1
  if (focusTrigger)
    nextTick(() => modalPriorityTriggerEl.value?.focus?.())
}

function toggleModalPriorityMenu() {
  if (isModalPriorityMenuOpen.value)
    closeModalPriorityMenu()
  else
    openModalPriorityMenu()
}

function selectModalPriority(value: typeof modalPriorityOptions[number]['value']) {
  editor.priority = value as TaskPriority
  closeModalPriorityMenu({ focusTrigger: true })
}

function handleModalPriorityTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isModalPriorityMenuOpen.value) {
    event.preventDefault()
    closeModalPriorityMenu({ focusTrigger: true })
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleModalPriorityMenu()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openModalPriorityMenu()
    const currentIndex = modalPriorityOptions.findIndex(option => option.value === editor.priority)
    if (event.key === 'ArrowDown')
      modalPriorityActiveIndex.value = Math.min(modalPriorityOptions.length - 1, Math.max(0, currentIndex) + 1)
    else
      modalPriorityActiveIndex.value = Math.max(0, (currentIndex >= 0 ? currentIndex : 0) - 1)
  }
}

function handleModalPriorityMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeModalPriorityMenu({ focusTrigger: true })
    return
  }

  if (event.key === 'Tab') {
    closeModalPriorityMenu()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const next = modalPriorityActiveIndex.value + delta
    if (next < 0)
      modalPriorityActiveIndex.value = modalPriorityOptions.length - 1
    else if (next >= modalPriorityOptions.length)
      modalPriorityActiveIndex.value = 0
    else
      modalPriorityActiveIndex.value = next
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (modalPriorityActiveIndex.value >= 0 && modalPriorityActiveIndex.value < modalPriorityOptions.length) {
      event.preventDefault()
      selectModalPriority(modalPriorityOptions[modalPriorityActiveIndex.value].value)
    }
  }
}

function resetEditor() {
  editor.title = ''
  editor.note = ''
  editor.status = 'todo'
  editor.priority = 'medium'
  editor.dueDate = ''
  editingId.value = ''
}

async function openCreate() {
  editorMode.value = 'create'
  resetEditor()
  isEditorOpen.value = true
  await nextTick()
  focusEditorTitle()
}

async function openEdit(task: Task) {
  editorMode.value = 'edit'
  editingId.value = task.id
  editor.title = task.title
  editor.note = task.note
  editor.status = task.status
  editor.priority = task.priority
  editor.dueDate = task.dueDate || ''
  isEditorOpen.value = true
  await nextTick()
  focusEditorTitle()
}

function closeEditor() {
  isEditorOpen.value = false
  resetEditor()
  closeModalStatusMenu()
  closeModalPriorityMenu()
}

function focusEditorTitle() {
  if (typeof document === 'undefined') return
  const el = document.querySelector<HTMLInputElement>('[data-task-editor-title]')
  el?.focus?.()
}

function upsertTask() {
  const title = editor.title.trim()
  if (!title) return

  const dueDate = editor.dueDate?.trim() ? editor.dueDate.trim() : undefined

  if (editorMode.value === 'create') {
    const createdAt = nowIso()
    const task: Task = {
      id: createId(),
      title,
      note: editor.note.trim(),
      status: editor.status,
      priority: editor.priority,
      dueDate,
      createdAt,
      updatedAt: createdAt,
    }
    tasks.value = [task, ...tasks.value]
  }
  else {
    const id = editingId.value
    tasks.value = tasks.value.map((task) => {
      if (task.id !== id) return task
      return {
        ...task,
        title,
        note: editor.note.trim(),
        status: editor.status,
        priority: editor.priority,
        dueDate,
        updatedAt: nowIso(),
      }
    })
  }

  closeEditor()
}

function deleteTask(task: Task) {
  if (typeof window !== 'undefined') {
    const ok = window.confirm(`删除任务“${task.title}”？此操作不可撤销。`)
    if (!ok) return
  }
  tasks.value = tasks.value.filter(t => t.id !== task.id)
}

function setStatus(task: Task, nextStatus: TaskStatus) {
  if (task.status === nextStatus) return
  tasks.value = tasks.value.map((t) => {
    if (t.id !== task.id) return t
    return { ...t, status: nextStatus, updatedAt: nowIso() }
  })
}

function statusLabel(status: TaskStatus) {
  if (status === 'todo') return '待办'
  if (status === 'doing') return '进行中'
  return '已完成'
}

function priorityLabel(priority: TaskPriority) {
  if (priority === 'low') return '低'
  if (priority === 'high') return '高'
  return '中'
}

function onDragStart(task: Task) {
  dragTaskId.value = task.id
}

function onDropToStatus(next: TaskStatus) {
  const id = dragTaskId.value
  if (!id) return
  const task = tasks.value.find(t => t.id === id)
  if (task) setStatus(task, next)
  dragTaskId.value = ''
}

function exportJson() {
  const payload: StoredPayloadV1 = {
    version: 1,
    updatedAt: Date.now(),
    tasks: tasks.value,
  }
  const raw = JSON.stringify(payload, null, 2)
  if (typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
    ;(navigator as any).clipboard.writeText(raw)
  }
  if (typeof window !== 'undefined')
    window.prompt('已生成 JSON（可复制/保存）：', raw)
}

function importJson() {
  if (typeof window === 'undefined') return
  const raw = window.prompt('粘贴 task-board JSON（会覆盖当前数据）：', '')
  if (!raw) return

  const parsed = safeParseJson(raw) as StoredPayloadV1 | null
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
    window.alert('导入失败：JSON 格式或版本不正确。')
    return
  }

  const normalized: Task[] = []
  for (const item of parsed.tasks) {
    const task = normalizeTask(item)
    if (task) normalized.push(task)
  }

  tasks.value = normalized.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function openDueDatePicker() {
  const input = dueDateInputEl.value
  if (!input) return
  const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker
  if (typeof showPicker === 'function')
    showPicker.call(input)
  else
    input.focus()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return

  if (isModalStatusMenuOpen.value) {
    closeModalStatusMenu({ focusTrigger: true })
    return
  }

  if (isModalPriorityMenuOpen.value) {
    closeModalPriorityMenu({ focusTrigger: true })
    return
  }

  if (isStatusMenuOpen.value) {
    closeStatusMenu({ focusTrigger: true })
    return
  }

  if (isEditorOpen.value)
    closeEditor()
}

let docPointerDownHandler: ((event: Event) => void) | null = null

onMounted(() => {
  isClient.value = true

  try {
    tasks.value = readStorage()
  }
  catch (error) {
    console.warn('[task-board] load failed', error)
    loadError.value = '任务数据读取失败（已使用空列表）。'
    tasks.value = []
  }

  if (typeof window !== 'undefined')
    window.addEventListener('keydown', handleKeydown, { passive: true })

  if (typeof document !== 'undefined') {
    docPointerDownHandler = (event: Event) => {
      const target = event.target as Node | null
      if (!target) return
      if (isStatusMenuOpen.value && !statusRoot.value?.contains(target))
        closeStatusMenu()
      if (isModalStatusMenuOpen.value && !modalStatusRoot.value?.contains(target))
        closeModalStatusMenu()
      if (isModalPriorityMenuOpen.value && !modalPriorityRoot.value?.contains(target))
        closeModalPriorityMenu()
    }
    document.addEventListener('pointerdown', docPointerDownHandler, true)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined')
    window.removeEventListener('keydown', handleKeydown)

  if (typeof document !== 'undefined' && docPointerDownHandler) {
    document.removeEventListener('pointerdown', docPointerDownHandler, true)
    docPointerDownHandler = null
  }
})

watch(
  tasks,
  (next) => {
    if (!isClient.value) return
    writeStorage(next)
  },
  { deep: true },
)
</script>

<template>
  <div class="board" aria-label="任务看板">
    <div class="top">
      <div class="title">
        <div class="badge" aria-hidden="true">
          <span class="badge-dot" />
        </div>
        <div class="title-text">
          <div class="title-main">任务看板</div>
          <div class="title-sub">
            默认以时间轴展示；数据保存在浏览器本地（localStorage）。
          </div>
        </div>
      </div>

      <div class="actions">
        <div class="seg" role="tablist" aria-label="视图切换">
          <button
            class="seg-btn"
            type="button"
            role="tab"
            :aria-selected="view === 'timeline'"
            :data-active="view === 'timeline'"
            @click="view = 'timeline'"
          >
            时间轴
          </button>
          <button
            class="seg-btn"
            type="button"
            role="tab"
            :aria-selected="view === 'board'"
            :data-active="view === 'board'"
            @click="view = 'board'"
          >
            看板
          </button>
        </div>

        <button class="btn primary" type="button" @click="openCreate">
          新建任务
        </button>
      </div>
    </div>

    <div class="toolbar" role="region" aria-label="筛选与搜索">
      <label class="search">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input v-model="search" class="search-input" type="search" placeholder="搜索标题/备注…" />
      </label>

      <div ref="statusRoot" class="select" role="group" aria-label="状态筛选">
        <span class="select-label">状态</span>
        <button
          ref="statusTriggerEl"
          class="select-trigger"
          type="button"
          :aria-expanded="isStatusMenuOpen ? 'true' : 'false'"
          aria-haspopup="listbox"
          aria-label="筛选状态"
          @click="toggleStatusMenu"
          @keydown="handleStatusTriggerKeydown"
        >
          <span class="select-trigger-text">{{ currentStatusLabel }}</span>
          <span class="select-trigger-chevron" :data-open="isStatusMenuOpen ? 'true' : 'false'" aria-hidden="true">
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

        <Transition name="filter-pop">
          <div
            v-show="isStatusMenuOpen"
            ref="statusMenuEl"
            class="select-menu"
            role="listbox"
            tabindex="-1"
            @keydown="handleStatusMenuKeydown"
          >
            <button
              v-for="(option, index) in statusOptions"
              :key="option.value"
              class="select-option"
              type="button"
              role="option"
              :aria-selected="option.value === statusFilter ? 'true' : 'false'"
              :data-active="index === statusActiveIndex ? 'true' : 'false'"
              @mouseenter="statusActiveIndex = index"
              @click="selectStatus(option.value)"
            >
              <span class="select-option-label">{{ option.label }}</span>
              <span v-if="option.value === statusFilter" class="select-option-check" aria-hidden="true">
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

      <label class="toggle">
        <input v-model="showDone" type="checkbox" />
        <span>显示已完成</span>
      </label>

      <div class="meta" aria-label="任务统计">
        <span class="pill">
          全部 <b>{{ counts.all }}</b>
        </span>
        <span class="pill todo">
          待办 <b>{{ counts.todo }}</b>
        </span>
        <span class="pill doing">
          进行中 <b>{{ counts.doing }}</b>
        </span>
        <span class="pill done">
          完成 <b>{{ counts.done }}</b>
        </span>
      </div>

      <div class="more">
        <button class="btn ghost" type="button" @click="exportJson">导出</button>
        <button class="btn ghost" type="button" @click="importJson">导入</button>
      </div>
    </div>

    <div v-if="loadError" class="banner" role="status">
      {{ loadError }}
    </div>

    <div class="content">
      <div v-if="!isClient" class="skeleton" aria-hidden="true">
        <div class="sk-line" />
        <div class="sk-line" />
        <div class="sk-line short" />
      </div>

      <template v-else>
        <div v-if="filteredTasks.length === 0" class="empty">
          <div class="empty-title">还没有任务</div>
          <div class="empty-desc">把想法拆成可执行的最小步骤，然后开始推进。</div>
          <button class="btn primary" type="button" @click="openCreate">添加第一条任务</button>
        </div>

        <template v-else>
          <div v-if="view === 'timeline'" class="timeline" role="list">
            <section
              v-for="group in timelineGroups"
              :key="group.dayKey"
              class="day"
              role="group"
              :aria-label="group.dayLabel"
            >
              <div class="day-header">
                <span class="day-dot" aria-hidden="true" />
                <span class="day-label">{{ group.dayLabel }}</span>
              </div>
              <div class="day-items">
                <article
                  v-for="task in group.items"
                  :key="task.id"
                  class="item"
                  role="listitem"
                  :data-status="task.status"
                >
                  <div class="item-line" aria-hidden="true">
                    <span class="item-node" />
                  </div>
                  <div class="item-card">
                    <div class="item-top">
                      <div class="item-title">
                        <span class="status" :data-status="task.status">{{ statusLabel(task.status) }}</span>
                        <span class="priority" :data-priority="task.priority">优先级 {{ priorityLabel(task.priority) }}</span>
                        <span v-if="task.dueDate" class="due">截止 {{ task.dueDate }}</span>
                      </div>
                      <div class="item-time">{{ formatTimeLabel(task.createdAt) }}</div>
                    </div>
                    <div class="item-main">
                      <div class="task-title">{{ task.title }}</div>
                      <div v-if="task.note" class="task-note">{{ task.note }}</div>
                    </div>
                    <div class="item-actions">
                      <div class="quick">
                        <button class="mini" type="button" @click="setStatus(task, 'todo')">待办</button>
                        <button class="mini" type="button" @click="setStatus(task, 'doing')">进行中</button>
                        <button class="mini" type="button" @click="setStatus(task, 'done')">完成</button>
                      </div>
                      <div class="ops">
                        <button class="mini ghost" type="button" @click="openEdit(task)">编辑</button>
                        <button class="mini danger" type="button" @click="deleteTask(task)">删除</button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <div v-else class="kanban" role="region" aria-label="看板视图">
            <section
              class="col"
              data-status="todo"
              role="region"
              aria-label="待办"
              @dragover.prevent
              @drop.prevent="onDropToStatus('todo')"
            >
              <header class="col-head">
                <span class="col-title">待办</span>
                <span class="col-count">{{ boardColumns.todo.length }}</span>
              </header>
              <div class="col-body">
                <article
                  v-for="task in boardColumns.todo"
                  :key="task.id"
                  class="kcard"
                  draggable="true"
                  @dragstart="onDragStart(task)"
                >
                  <div class="k-top">
                    <span class="priority" :data-priority="task.priority">优先级 {{ priorityLabel(task.priority) }}</span>
                    <span class="k-time">{{ formatTimeLabel(task.updatedAt) }}</span>
                  </div>
                  <div class="k-title">{{ task.title }}</div>
                  <div v-if="task.note" class="k-note">{{ task.note }}</div>
                  <div class="k-actions">
                    <select
                      class="k-move"
                      :value="task.status"
                      aria-label="移动到"
                      @change="setStatus(task, ($event.target as HTMLSelectElement).value as TaskStatus)"
                    >
                      <option value="todo">待办</option>
                      <option value="doing">进行中</option>
                      <option value="done">已完成</option>
                    </select>
                    <button class="mini ghost" type="button" @click="openEdit(task)">编辑</button>
                    <button class="mini danger" type="button" @click="deleteTask(task)">删除</button>
                  </div>
                </article>
              </div>
            </section>

            <section
              class="col"
              data-status="doing"
              role="region"
              aria-label="进行中"
              @dragover.prevent
              @drop.prevent="onDropToStatus('doing')"
            >
              <header class="col-head">
                <span class="col-title">进行中</span>
                <span class="col-count">{{ boardColumns.doing.length }}</span>
              </header>
              <div class="col-body">
                <article
                  v-for="task in boardColumns.doing"
                  :key="task.id"
                  class="kcard"
                  draggable="true"
                  @dragstart="onDragStart(task)"
                >
                  <div class="k-top">
                    <span class="priority" :data-priority="task.priority">优先级 {{ priorityLabel(task.priority) }}</span>
                    <span class="k-time">{{ formatTimeLabel(task.updatedAt) }}</span>
                  </div>
                  <div class="k-title">{{ task.title }}</div>
                  <div v-if="task.note" class="k-note">{{ task.note }}</div>
                  <div class="k-actions">
                    <select
                      class="k-move"
                      :value="task.status"
                      aria-label="移动到"
                      @change="setStatus(task, ($event.target as HTMLSelectElement).value as TaskStatus)"
                    >
                      <option value="todo">待办</option>
                      <option value="doing">进行中</option>
                      <option value="done">已完成</option>
                    </select>
                    <button class="mini ghost" type="button" @click="openEdit(task)">编辑</button>
                    <button class="mini danger" type="button" @click="deleteTask(task)">删除</button>
                  </div>
                </article>
              </div>
            </section>

            <section
              class="col"
              data-status="done"
              role="region"
              aria-label="已完成"
              @dragover.prevent
              @drop.prevent="onDropToStatus('done')"
            >
              <header class="col-head">
                <span class="col-title">已完成</span>
                <span class="col-count">{{ boardColumns.done.length }}</span>
              </header>
              <div class="col-body">
                <article
                  v-for="task in boardColumns.done"
                  :key="task.id"
                  class="kcard"
                  draggable="true"
                  @dragstart="onDragStart(task)"
                >
                  <div class="k-top">
                    <span class="priority" :data-priority="task.priority">优先级 {{ priorityLabel(task.priority) }}</span>
                    <span class="k-time">{{ formatTimeLabel(task.updatedAt) }}</span>
                  </div>
                  <div class="k-title">{{ task.title }}</div>
                  <div v-if="task.note" class="k-note">{{ task.note }}</div>
                  <div class="k-actions">
                    <select
                      class="k-move"
                      :value="task.status"
                      aria-label="移动到"
                      @change="setStatus(task, ($event.target as HTMLSelectElement).value as TaskStatus)"
                    >
                      <option value="todo">待办</option>
                      <option value="doing">进行中</option>
                      <option value="done">已完成</option>
                    </select>
                    <button class="mini ghost" type="button" @click="openEdit(task)">编辑</button>
                    <button class="mini danger" type="button" @click="deleteTask(task)">删除</button>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </template>
      </template>
    </div>

    <Teleport v-if="isEditorOpen" to="body">
      <div class="modal-backdrop" role="presentation" @click.self="closeEditor">
        <div class="modal" role="dialog" aria-modal="true" aria-label="任务编辑器">
          <div class="modal-head">
            <div class="modal-title">{{ editorMode === 'create' ? '新建任务' : '编辑任务' }}</div>
            <button class="icon" type="button" aria-label="关闭" @click="closeEditor">×</button>
          </div>

          <div class="modal-body">
            <label class="field">
              <span class="field-label">标题</span>
              <input
                v-model="editor.title"
                data-task-editor-title
                class="field-input"
                type="text"
                placeholder="例如：重构侧边栏索引生成脚本"
                @keydown.enter.prevent="upsertTask"
              />
            </label>

            <label class="field">
              <span class="field-label">备注</span>
              <textarea
                v-model="editor.note"
                class="field-input area"
                rows="3"
                placeholder="补充上下文、链接、验收标准…"
              />
            </label>

            <div class="row">
              <label class="field">
                <span class="field-label">状态</span>
                <div ref="modalStatusRoot" class="field-select">
                  <button
                    ref="modalStatusTriggerEl"
                    class="field-trigger"
                    type="button"
                    :aria-expanded="isModalStatusMenuOpen ? 'true' : 'false'"
                    aria-haspopup="listbox"
                    aria-label="状态"
                    @click="toggleModalStatusMenu"
                    @keydown="handleModalStatusTriggerKeydown"
                  >
                    <span class="field-trigger-text">{{ modalStatusLabel }}</span>
                    <span class="field-trigger-chevron" :data-open="isModalStatusMenuOpen ? 'true' : 'false'" aria-hidden="true">
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

                  <Transition name="field-pop">
                    <div
                      v-show="isModalStatusMenuOpen"
                      ref="modalStatusMenuEl"
                      class="field-menu"
                      role="listbox"
                      tabindex="-1"
                      @keydown="handleModalStatusMenuKeydown"
                    >
                      <button
                        v-for="(option, index) in modalStatusOptions"
                        :key="option.value"
                        class="field-option"
                        type="button"
                        role="option"
                        :aria-selected="option.value === editor.status ? 'true' : 'false'"
                        :data-active="index === modalStatusActiveIndex ? 'true' : 'false'"
                        @mouseenter="modalStatusActiveIndex = index"
                        @click="selectModalStatus(option.value)"
                      >
                        <span class="field-option-label">{{ option.label }}</span>
                        <span v-if="option.value === editor.status" class="field-option-check" aria-hidden="true">
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
              </label>

              <label class="field">
                <span class="field-label">优先级</span>
                <div ref="modalPriorityRoot" class="field-select">
                  <button
                    ref="modalPriorityTriggerEl"
                    class="field-trigger"
                    type="button"
                    :aria-expanded="isModalPriorityMenuOpen ? 'true' : 'false'"
                    aria-haspopup="listbox"
                    aria-label="优先级"
                    @click="toggleModalPriorityMenu"
                    @keydown="handleModalPriorityTriggerKeydown"
                  >
                    <span class="field-trigger-text">{{ modalPriorityLabel }}</span>
                    <span class="field-trigger-chevron" :data-open="isModalPriorityMenuOpen ? 'true' : 'false'" aria-hidden="true">
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

                  <Transition name="field-pop">
                    <div
                      v-show="isModalPriorityMenuOpen"
                      ref="modalPriorityMenuEl"
                      class="field-menu"
                      role="listbox"
                      tabindex="-1"
                      @keydown="handleModalPriorityMenuKeydown"
                    >
                      <button
                        v-for="(option, index) in modalPriorityOptions"
                        :key="option.value"
                        class="field-option"
                        type="button"
                        role="option"
                        :aria-selected="option.value === editor.priority ? 'true' : 'false'"
                        :data-active="index === modalPriorityActiveIndex ? 'true' : 'false'"
                        @mouseenter="modalPriorityActiveIndex = index"
                        @click="selectModalPriority(option.value)"
                      >
                        <span class="field-option-label">{{ option.label }}</span>
                        <span v-if="option.value === editor.priority" class="field-option-check" aria-hidden="true">
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
              </label>

              <label class="field">
                <span class="field-label">截止</span>
                <input
                  ref="dueDateInputEl"
                  v-model="editor.dueDate"
                  class="field-input"
                  type="date"
                  @click="openDueDatePicker"
                />
              </label>
            </div>
          </div>

          <div class="modal-foot">
            <button class="btn ghost" type="button" @click="closeEditor">取消</button>
            <button class="btn primary" type="button" :disabled="!editor.title.trim()" @click="upsertTask">
              {{ editorMode === 'create' ? '创建' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.board {
  --ink: color-mix(in oklab, var(--vp-c-text-1) 92%, black);
  --muted: color-mix(in oklab, var(--vp-c-text-2) 88%, var(--vp-c-text-1));
  --line: color-mix(in oklab, var(--vp-c-divider) 72%, transparent);
  --surface: var(--dash-surface);
  --surface-2: var(--dash-surface-2);
  --brand: var(--vp-c-brand-3);
  --accent-a: var(--dash-accent-a);
  --accent-b: var(--dash-accent-b);
  --danger: #ef4444;
  --ok: #22c55e;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
  background: linear-gradient(180deg,
      color-mix(in oklab, var(--surface) 96%, white),
      color-mix(in oklab, var(--surface-2) 86%, transparent));
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.board::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 420px at 20% 10%, color-mix(in oklab, var(--accent-a) 14%, transparent), transparent 62%),
    radial-gradient(800px 520px at 88% 0%, color-mix(in oklab, var(--accent-b) 14%, transparent), transparent 64%),
    repeating-linear-gradient(135deg, color-mix(in oklab, var(--dash-grid) 85%, transparent) 0 1px, transparent 1px 14px);
  pointer-events: none;
}

.top {
  position: relative;
  z-index: 2;
}

.toolbar {
  position: relative;
  z-index: 3;
}

.content {
  position: relative;
  z-index: 1;
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 14px 10px;
}

.title {
  display: flex;
  gap: 10px;
  min-width: 0;
}

.badge {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 72%, transparent);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  display: grid;
  place-items: center;
}

.badge-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-a), var(--accent-b));
  box-shadow:
    0 0 0 6px color-mix(in oklab, var(--accent-b) 10%, transparent),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.title-main {
  font-weight: 860;
  letter-spacing: 0.02em;
  color: var(--ink);
}

.title-sub {
  margin-top: 2px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
  opacity: 0.9;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.seg {
  display: inline-flex;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 70%, transparent);
  padding: 3px;
}

.seg-btn {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-weight: 720;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.seg-btn[data-active="true"] {
  background: linear-gradient(135deg,
      color-mix(in oklab, var(--accent-a) 26%, transparent),
      color-mix(in oklab, var(--accent-b) 22%, transparent));
  color: var(--ink);
}

.seg-btn:hover {
  transform: translateY(-1px);
}

.btn {
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 70%, transparent);
  color: var(--ink);
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  font-weight: 740;
  font-size: 13px;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.btn:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 26%, var(--line));
  background: color-mix(in oklab, var(--surface) 82%, transparent);
}

.btn:active {
  transform: translateY(0);
}

.btn.primary {
  border-color: color-mix(in oklab, var(--brand) 32%, var(--line));
  background: linear-gradient(135deg,
      color-mix(in oklab, var(--brand) 28%, var(--surface)),
      color-mix(in oklab, var(--accent-b) 20%, var(--surface)));
}

.btn.ghost {
  opacity: 0.95;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 14px 12px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid color-mix(in oklab, var(--line) 75%, transparent);
  background: color-mix(in oklab, var(--surface) 84%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 10px 26px rgba(0, 0, 0, 0.06);
}

.search {
  flex: 1 1 260px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 74%, transparent);
  border-radius: 14px;
  height: 38px;
  padding: 0 12px;
}

.search-icon {
  color: var(--muted);
  font-weight: 800;
  opacity: 0.8;
}

.search-input {
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ink);
  font-size: 13px;
}

.select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 74%, transparent);
  height: 38px;
  padding: 0 10px;
  border-radius: 14px;
}

.select-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.select:focus-within {
  border-color: color-mix(in oklab, var(--brand) 30%, var(--line));
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 12%, transparent);
}

.select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ink);
  height: 30px;
  padding: 0 6px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 760;
  transition: transform 160ms ease, color 160ms ease;
}

.select-trigger:hover {
  transform: translateY(-1px);
}

.select-trigger:active {
  transform: translateY(0);
}

.select-trigger-text {
  min-width: 78px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: color-mix(in oklab, var(--vp-c-text-1) 92%, transparent);
}

.select-trigger-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 10px;
  color: var(--muted);
  background: color-mix(in oklab, var(--surface-2) 78%, transparent);
  border: 1px solid color-mix(in oklab, var(--line) 80%, transparent);
  transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.select-trigger:hover .select-trigger-chevron {
  color: var(--brand);
  background: color-mix(in oklab, var(--surface-2) 92%, transparent);
}

.select-trigger-chevron[data-open="true"] {
  transform: rotate(180deg);
}

.select-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 190px;
  max-width: min(72vw, 240px);
  border-radius: 14px;
  padding: 6px;
  border: 1px solid color-mix(in oklab, var(--brand) 12%, var(--line));
  background:
    radial-gradient(520px 220px at 14% 0%, color-mix(in oklab, var(--accent-b) 14%, transparent), transparent 70%),
    radial-gradient(520px 220px at 86% 0%, color-mix(in oklab, var(--accent-a) 12%, transparent), transparent 72%),
    color-mix(in oklab, var(--surface) 92%, transparent);
  backdrop-filter: blur(14px) saturate(1.08);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.18);
  max-height: min(240px, calc(100vh - 220px));
  overflow: auto;
  z-index: 10;
}

.select-option {
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

.select-option:hover,
.select-option[data-active="true"] {
  background: color-mix(in oklab, var(--vp-c-bg) 40%, transparent);
  border-color: color-mix(in oklab, var(--brand) 14%, transparent);
}

.select-option:active {
  transform: translateY(1px);
}

.select-option[aria-selected="true"] {
  background: color-mix(in oklab, var(--vp-c-brand-soft) 55%, transparent);
  border-color: color-mix(in oklab, var(--brand) 22%, transparent);
}

.select-option-label {
  min-width: 0;
  text-align: left;
}

.select-option-check {
  color: var(--brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--surface-2) 82%, transparent);
  border: 1px solid color-mix(in oklab, var(--brand) 16%, transparent);
}

.filter-pop-enter-active,
.filter-pop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease, filter 160ms ease;
}

.filter-pop-enter-from,
.filter-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
  filter: blur(8px);
}

@media (prefers-reduced-motion: reduce) {
  .select-trigger,
  .select-option {
    transition: none;
  }

  .filter-pop-enter-active,
  .filter-pop-leave-active {
    transition: opacity 1ms linear;
  }

  .filter-pop-enter-from,
  .filter-pop-leave-to {
    transform: none;
    filter: none;
  }
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  user-select: none;
}

.toggle input {
  accent-color: var(--brand);
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface-2) 76%, transparent);
  border-radius: 999px;
  height: 32px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 720;
}

.pill b {
  color: var(--ink);
}

.pill.todo b { color: color-mix(in oklab, var(--brand) 80%, var(--ink)); }
.pill.doing b { color: color-mix(in oklab, var(--accent-b) 82%, var(--ink)); }
.pill.done b { color: color-mix(in oklab, var(--ok) 78%, var(--ink)); }

.more {
  margin-left: auto;
  display: inline-flex;
  gap: 8px;
}

.banner {
  margin: 0 14px 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in oklab, var(--danger) 35%, var(--line));
  background: color-mix(in oklab, var(--danger) 10%, var(--surface));
  color: var(--ink);
  font-size: 13px;
}

.content {
  margin: 0 14px 14px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid color-mix(in oklab, var(--line) 72%, transparent);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.skeleton {
  border-radius: 16px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 70%, transparent);
  padding: 14px;
}

.sk-line {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--vp-c-divider) 60%, transparent);
  margin-top: 10px;
}

.sk-line:first-child {
  margin-top: 0;
}

.sk-line.short {
  width: 60%;
}

.empty {
  border-radius: 18px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 72%, transparent);
  padding: 18px;
  display: grid;
  gap: 10px;
}

.empty-title {
  color: var(--ink);
  font-weight: 860;
}

.empty-desc {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.timeline {
  display: grid;
  gap: 14px;
}

.day-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 780;
}

.day-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-a), var(--accent-b));
  box-shadow: 0 0 0 5px color-mix(in oklab, var(--accent-b) 10%, transparent);
}

.day-items {
  margin-top: 10px;
  display: grid;
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: stretch;
}

.item-line {
  position: relative;
  display: grid;
  justify-items: center;
}

.item-line::before {
  content: "";
  position: absolute;
  inset: 0;
  width: 2px;
  background: linear-gradient(180deg,
      transparent,
      color-mix(in oklab, var(--line) 85%, transparent),
      transparent);
}

.item-node {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 14px;
  background: color-mix(in oklab, var(--brand) 70%, var(--accent-b));
  box-shadow: 0 0 0 5px color-mix(in oklab, var(--brand) 10%, transparent);
}

.item[data-status="doing"] .item-node {
  background: color-mix(in oklab, var(--accent-b) 85%, var(--brand));
}

.item[data-status="done"] .item-node {
  background: color-mix(in oklab, var(--ok) 75%, var(--brand));
}

.item-card {
  border-radius: 18px;
  border: 1px solid var(--line);
  background: linear-gradient(135deg,
      color-mix(in oklab, var(--surface) 82%, transparent),
      color-mix(in oklab, var(--surface-2) 72%, transparent));
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.08);
  padding: 12px 12px 10px;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.item-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 22%, var(--line));
  background: color-mix(in oklab, var(--surface) 82%, transparent);
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.item-title {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.status,
.priority,
.due {
  border-radius: 999px;
  border: 1px solid var(--line);
  height: 26px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 760;
  color: var(--muted);
  background: color-mix(in oklab, var(--surface-2) 78%, transparent);
}

.status[data-status="todo"] {
  color: color-mix(in oklab, var(--brand) 70%, var(--muted));
  border-color: color-mix(in oklab, var(--brand) 22%, var(--line));
}

.status[data-status="doing"] {
  color: color-mix(in oklab, var(--accent-b) 78%, var(--muted));
  border-color: color-mix(in oklab, var(--accent-b) 24%, var(--line));
}

.status[data-status="done"] {
  color: color-mix(in oklab, var(--ok) 78%, var(--muted));
  border-color: color-mix(in oklab, var(--ok) 26%, var(--line));
}

.priority[data-priority="high"] {
  border-color: color-mix(in oklab, var(--danger) 30%, var(--line));
  color: color-mix(in oklab, var(--danger) 65%, var(--muted));
}

.priority[data-priority="low"] {
  border-color: color-mix(in oklab, var(--accent-a) 25%, var(--line));
  color: color-mix(in oklab, var(--accent-a) 70%, var(--muted));
}

.item-time {
  color: var(--muted);
  font-size: 12px;
  font-weight: 720;
  opacity: 0.9;
}

.item-main {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.task-title {
  color: var(--ink);
  font-weight: 840;
  letter-spacing: 0.01em;
  line-height: 1.35;
}

.task-note {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.item-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.mini {
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface-2) 78%, transparent);
  color: var(--ink);
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 760;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.mini:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 22%, var(--line));
  background: color-mix(in oklab, var(--surface-2) 88%, transparent);
}

.mini:active {
  transform: translateY(0);
}

.mini.ghost {
  color: var(--muted);
}

.mini.danger {
  border-color: color-mix(in oklab, var(--danger) 28%, var(--line));
  color: color-mix(in oklab, var(--danger) 70%, var(--ink));
}

.quick,
.ops {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.kanban {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.col {
  border-radius: 18px;
  border: 1px solid var(--line);
  background: linear-gradient(160deg,
      color-mix(in oklab, var(--surface) 82%, transparent),
      color-mix(in oklab, var(--surface-2) 70%, transparent));
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 280px;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(135deg,
      color-mix(in oklab, var(--surface-2) 84%, transparent),
      color-mix(in oklab, var(--surface) 72%, transparent));
}

.col-title {
  color: var(--ink);
  font-weight: 860;
}

.col-count {
  color: var(--muted);
  font-size: 12px;
  font-weight: 780;
}

.col-body {
  padding: 12px;
  display: grid;
  gap: 10px;
  align-content: start;
}

.kcard {
  border-radius: 16px;
  border: 1px solid var(--line);
  background: linear-gradient(150deg,
      color-mix(in oklab, var(--surface-2) 82%, transparent),
      color-mix(in oklab, var(--surface) 72%, transparent));
  padding: 10px 10px 9px;
  cursor: grab;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.kcard:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 22%, var(--line));
  background: color-mix(in oklab, var(--surface-2) 90%, transparent);
}

.kcard:active {
  cursor: grabbing;
}

.k-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.k-time {
  color: var(--muted);
  font-size: 12px;
  font-weight: 740;
}

.k-title {
  margin-top: 8px;
  color: var(--ink);
  font-weight: 840;
  line-height: 1.35;
}

.k-note {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.k-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.k-move {
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 68%, transparent);
  color: var(--ink);
  padding: 0 8px;
  font-size: 12px;
  font-weight: 760;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(1200px 520px at 20% 20%, color-mix(in oklab, var(--accent-a) 18%, transparent), transparent 62%),
    radial-gradient(900px 520px at 80% 10%, color-mix(in oklab, var(--accent-b) 16%, transparent), transparent 64%),
    color-mix(in oklab, var(--vp-c-bg) 55%, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(14px) saturate(1.08);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 80;
}

.modal {
  width: min(720px, 96vw);
  border-radius: 22px;
  border: 1px solid color-mix(in oklab, var(--line) 78%, transparent);
  background: linear-gradient(160deg,
      color-mix(in oklab, var(--surface) 96%, white),
      color-mix(in oklab, var(--surface-2) 86%, transparent));
  box-shadow: 0 36px 120px rgba(0, 0, 0, 0.34);
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
  background: linear-gradient(135deg,
      color-mix(in oklab, var(--accent-a) 14%, var(--surface)),
      color-mix(in oklab, var(--accent-b) 14%, var(--surface)));
}

.modal-title {
  font-size: 16px;
  font-weight: 880;
  letter-spacing: 0.02em;
  color: var(--ink);
}

.icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
  background: color-mix(in oklab, var(--surface-2) 84%, transparent);
  color: var(--ink);
  font-size: 18px;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease;
}

.icon:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 28%, var(--line));
  color: var(--brand);
  background: color-mix(in oklab, var(--surface-2) 94%, transparent);
}

.icon:active {
  transform: translateY(0);
}

.modal-body {
  padding: 16px 18px 12px;
  display: grid;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 1fr;
  gap: 10px;
}

.field {
  display: grid;
  gap: 6px;
}

.field-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 780;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-input {
  border: 1px solid color-mix(in oklab, var(--line) 76%, transparent);
  background: color-mix(in oklab, var(--vp-c-bg) 90%, white);
  color: var(--ink);
  border-radius: 14px;
  height: 38px;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.field-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: 38px;
  padding: 0 8px;
  border-radius: 12px;
  border: 1px solid color-mix(in oklab, var(--line) 76%, transparent);
  background: color-mix(in oklab, var(--vp-c-bg) 92%, white);
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.field-select:focus-within {
  border-color: color-mix(in oklab, var(--brand) 34%, var(--line));
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 14%, transparent);
  background: color-mix(in oklab, var(--vp-c-bg) 96%, white);
}

.field-trigger {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ink);
  height: 30px;
  padding: 0 4px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 760;
  transition: transform 160ms ease, color 160ms ease;
}

.field-trigger:hover {
  transform: translateY(-1px);
}

.field-trigger:active {
  transform: translateY(0);
}

.field-trigger-text {
  min-width: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: color-mix(in oklab, var(--vp-c-text-1) 92%, transparent);
}

.field-trigger-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  color: var(--muted);
  background: color-mix(in oklab, var(--surface-2) 82%, transparent);
  border: 1px solid color-mix(in oklab, var(--line) 80%, transparent);
  transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.field-trigger:hover .field-trigger-chevron {
  color: var(--brand);
  background: color-mix(in oklab, var(--surface-2) 92%, transparent);
}

.field-trigger-chevron[data-open="true"] {
  transform: rotate(180deg);
}

.field-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  min-width: 140px;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid color-mix(in oklab, var(--brand) 12%, var(--line));
  background:
    radial-gradient(360px 200px at 20% 0%, color-mix(in oklab, var(--accent-b) 12%, transparent), transparent 70%),
    radial-gradient(360px 200px at 80% 0%, color-mix(in oklab, var(--accent-a) 12%, transparent), transparent 72%),
    color-mix(in oklab, var(--surface) 92%, transparent);
  backdrop-filter: blur(12px) saturate(1.06);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  max-height: min(220px, calc(100vh - 320px));
  overflow: auto;
  z-index: 6;
}

.field-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease, color 160ms ease;
}

.field-option:hover,
.field-option[data-active="true"] {
  background: color-mix(in oklab, var(--vp-c-bg) 42%, transparent);
  border-color: color-mix(in oklab, var(--brand) 14%, transparent);
}

.field-option:active {
  transform: translateY(1px);
}

.field-option[aria-selected="true"] {
  background: color-mix(in oklab, var(--vp-c-brand-soft) 56%, transparent);
  border-color: color-mix(in oklab, var(--brand) 22%, transparent);
}

.field-option-label {
  min-width: 0;
  text-align: left;
}

.field-option-check {
  color: var(--brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--surface-2) 82%, transparent);
  border: 1px solid color-mix(in oklab, var(--brand) 16%, transparent);
}

.field-pop-enter-active,
.field-pop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease, filter 160ms ease;
}

.field-pop-enter-from,
.field-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
  filter: blur(8px);
}

.field-input.area {
  height: auto;
  padding: 10px 12px;
  resize: vertical;
}

.field-input::placeholder {
  color: color-mix(in oklab, var(--muted) 80%, transparent);
}

.field-input:focus {
  border-color: color-mix(in oklab, var(--brand) 34%, var(--line));
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 14%, transparent);
  background: color-mix(in oklab, var(--vp-c-bg) 96%, white);
}

.modal-foot {
  padding: 12px 18px 16px;
  border-top: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
  background: color-mix(in oklab, var(--surface-2) 78%, transparent);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal .btn {
  height: 36px;
  border-radius: 12px;
  padding: 0 16px;
}

@media (max-width: 880px) {
  .kanban {
    grid-template-columns: 1fr;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .more {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .field-trigger,
  .field-option {
    transition: none;
  }

  .field-pop-enter-active,
  .field-pop-leave-active {
    transition: opacity 1ms linear;
  }

  .field-pop-enter-from,
  .field-pop-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
