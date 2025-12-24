<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { VPTeamMembers } from 'vitepress/theme'
import { creators } from '../../creators'
import { siteDescription, siteName } from '../../../metadata'

type WeatherData = {
  city: string
  text: string
  temperature: string
  wind?: string
  time?: string
}

type Coords = {
  name: string
  lat: number
  lon: number
}

type ReverseGeocodeResponse = {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
}

const env = (import.meta as any).env || {}
const defaultLocation: Coords = {
  name: env.VITE_WEATHER_CITY || '武汉',
  lat: Number(env.VITE_WEATHER_LAT) || 30.5928,
  lon: Number(env.VITE_WEATHER_LON) || 114.3055,
}

const now = ref(new Date())
const greeting = ref('')
const weather = ref<WeatherData>({
  city: defaultLocation.name,
  text: '加载中',
  temperature: '--°C',
})
const weatherError = ref('')
const isWeatherLoading = ref(false)
const hasGeoTried = ref(false)
const resolvedGeoName = ref('')
const isGeoNameLoading = ref(false)

const quickLinks = [
  { label: 'INBOX', desc: '收集灵感', href: '/笔记/' },
  { label: '任务看板', desc: '推进进度', href: '/toc' },
  { label: '书影空间', desc: '随手摘录', href: '/笔记/' },
  { label: '图书馆', desc: '主题索引', href: '/笔记/' },
] as const

const tools = [
  { label: '全文检索', href: '/' },
  { label: '最近更新', href: '/toc' },
  { label: '笔记入口', href: '/笔记/' },
  { label: '分享此页', href: '#' },
] as const

function formatTime(value: Date) {
  return value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(value: Date) {
  return value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function updateGreeting(value: Date) {
  const hour = value.getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function mapWeatherCode(code: number) {
  if ([0].includes(code)) return '晴'
  if ([1, 2, 3].includes(code)) return '多云'
  if ([45, 48].includes(code)) return '有雾'
  if ([51, 53, 55].includes(code)) return '毛毛雨'
  if ([56, 57].includes(code)) return '冻雨'
  if ([61, 63, 65].includes(code)) return '小/中/大雨'
  if ([66, 67].includes(code)) return '冻雨'
  if ([71, 73, 75].includes(code)) return '小/中/大雪'
  if ([77].includes(code)) return '雪粒'
  if ([80, 81, 82].includes(code)) return '阵雨'
  if ([85, 86].includes(code)) return '阵雪'
  if ([95].includes(code)) return '雷阵雨'
  if ([96, 99].includes(code)) return '雷暴'
  return '天气'
}

function formatResolvedPlace(payload: ReverseGeocodeResponse) {
  const city = payload.city?.trim()
  const locality = payload.locality?.trim()
  const province = payload.principalSubdivision?.trim()

  const parts = [city, locality]
    .filter(Boolean)
    .filter((part, index, arr) => arr.indexOf(part) === index)

  if (parts.length > 0) return parts.join(' · ')
  return province || ''
}

async function fetchResolvedPlaceName(lat: number, lon: number) {
  if (typeof fetch === 'undefined') return
  isGeoNameLoading.value = true

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)

    const payload = (await res.json()) as ReverseGeocodeResponse
    resolvedGeoName.value = formatResolvedPlace(payload)
  }
  catch (error) {
    console.warn('[reverse-geocode]', error)
    resolvedGeoName.value = ''
  }
  finally {
    isGeoNameLoading.value = false
  }
}

async function fetchWeather(coords: Coords = defaultLocation) {
  if (typeof fetch === 'undefined') return
  isWeatherLoading.value = true
  weatherError.value = ''

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=Asia/Shanghai`
    const res = await fetch(url, { cache: 'no-cache' })

    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)

    const payload = await res.json()
    const current = payload?.current_weather
    if (!current)
      throw new Error('missing current_weather')

    weather.value = {
      city: coords.name,
      text: mapWeatherCode(current.weathercode),
      temperature: `${Math.round(current.temperature)}°C`,
      wind: `风速 ${Math.round(current.windspeed)} km/h`,
      time: current.time,
    }
  }
  catch (error) {
    console.error('[weather]', error)
    weatherError.value = '天气获取失败，已使用默认占位'
  }
  finally {
    isWeatherLoading.value = false
  }
}

function formatGeoError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED)
    return '定位权限被拒绝，可在浏览器权限设置中开启'
  if (error.code === error.POSITION_UNAVAILABLE)
    return '无法获取位置信息（系统定位服务关闭或不可用）'
  if (error.code === error.TIMEOUT)
    return '定位超时，请稍后重试'
  return error.message || '无法获取定位，使用默认城市'
}

function tryGeolocation(force = false) {
  if (!force && hasGeoTried.value) return
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    weatherError.value = weatherError.value || '当前环境不支持定位，使用默认城市'
    return
  }

  if (!force)
    hasGeoTried.value = true

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      resolvedGeoName.value = ''
      fetchWeather({
        name: '当前位置',
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      })
      fetchResolvedPlaceName(pos.coords.latitude, pos.coords.longitude)
    },
    (error) => {
      isGeoNameLoading.value = false
      resolvedGeoName.value = ''
      weatherError.value = weatherError.value || formatGeoError(error)
    },
    { enableHighAccuracy: false, timeout: 8000 },
  )
}

let timer: number | undefined

onMounted(() => {
  greeting.value = updateGreeting(now.value)
  fetchWeather(defaultLocation)
  tryGeolocation()
  timer = window.setInterval(() => {
    now.value = new Date()
    greeting.value = updateGreeting(now.value)
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div class="dash">
    <section class="hero">
      <div class="hero-cover" aria-hidden="true" />
      <div class="hero-grid">
        <div class="hero-left">
          <div class="brand">
            <span class="brand-dot" aria-hidden="true" />
            <span class="brand-name">{{ siteName }}</span>
          </div>
          <h1 class="headline">
            记录回忆，知识和畅想的地方
          </h1>
          <p class="subline">
            {{ siteDescription }}
          </p>

          <div class="hero-actions">
            <a class="btn primary" :href="withBase('/笔记/')">开始阅读</a>
            <a class="btn ghost" :href="withBase('/toc')">最近更新</a>
            <a class="btn ghost" href="https://github.com/nolebase/nolebase" target="_blank" rel="noreferrer">GitHub</a>
          </div>

          <div class="quick-row" role="list">
            <a
              v-for="item in quickLinks"
              :key="item.label"
              class="quick"
              role="listitem"
              :href="withBase(item.href)"
            >
              <div class="quick-top">
                <span class="quick-label">{{ item.label }}</span>
                <span class="quick-arrow" aria-hidden="true">↗</span>
              </div>
              <div class="quick-desc">{{ item.desc }}</div>
            </a>
          </div>
        </div>

        <aside class="hero-right">
          <div class="widget clock">
            <div class="clock-ring" aria-hidden="true" />
            <div class="clock-inner">
              <div class="clock-greeting">{{ greeting }}</div>
              <div class="clock-time">{{ formatTime(now) }}</div>
              <div class="clock-date">{{ formatDate(now) }}</div>
            </div>
          </div>

          <div class="widget weather">
            <div class="weather-row">
              <div class="weather-city">
                <span>{{ weather.city }}</span>
                <span v-if="resolvedGeoName" class="weather-place">{{ resolvedGeoName }}</span>
                <span v-else-if="isGeoNameLoading" class="weather-place loading">定位中…</span>
              </div>
              <div v-if="weatherError" class="weather-pill warn">
                <span class="weather-dot" aria-hidden="true" />
                <span>获取失败</span>
              </div>
              <div v-else class="weather-pill">
                <span class="weather-dot" aria-hidden="true" />
                <span>{{ isWeatherLoading ? '更新中…' : weather.text }}</span>
              </div>
            </div>
            <div class="weather-temp">{{ weather.temperature }}</div>
            <div class="weather-meta">
              <span v-if="weather.wind" class="meta-pill">{{ weather.wind }}</span>
              <span v-if="weather.time" class="meta-pill subtle">更新 {{ weather.time }}</span>
              <button class="geo" type="button" @click="tryGeolocation(true)">
                用定位更新
              </button>
            </div>
            <div class="weather-hint">
              <span v-if="isWeatherLoading">正在拉取天气数据...</span>
              <span v-else-if="weatherError">{{ weatherError }}</span>
              <span v-else>数据来自 open-meteo.com，可通过环境变量 VITE_WEATHER_LAT/LON/CITY 指定默认城市。</span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="below">
      <div class="cards">
        <div class="card large">
          <div class="card-title">今天要完成的任务</div>
          <div class="card-kicker">把“想做”变成“已完成”。</div>
          <div class="list">
            <a class="list-item" :href="withBase('/toc')">
              <span class="dot ok" aria-hidden="true" />
              <span class="list-text">查看最近更新与目录</span>
              <span class="list-meta">/toc</span>
            </a>
            <a class="list-item" :href="withBase('/笔记/')">
              <span class="dot warn" aria-hidden="true" />
              <span class="list-text">继续阅读：从“笔记”入口开始</span>
              <span class="list-meta">/笔记/</span>
            </a>
            <a class="list-item" href="https://discord.gg/XuNFDcDZGj" target="_blank" rel="noreferrer">
              <span class="dot info" aria-hidden="true" />
              <span class="list-text">加入 Discord：交流与共建</span>
              <span class="list-meta">discord.gg</span>
            </a>
          </div>
        </div>

        <div class="card">
          <div class="card-title">常用工具</div>
          <div class="chips">
            <a
              v-for="item in tools"
              :key="item.label"
              class="chip"
              :href="item.href === '#' ? undefined : withBase(item.href)"
              :data-disabled="item.href === '#'"
              :title="item.href === '#' ? '由右上角分享按钮提供' : undefined"
            >
              {{ item.label }}
            </a>
          </div>
          <div class="card-note">提示：全文检索在右上角搜索框。</div>
        </div>

        <div class="card">
          <div class="card-title">创作者</div>
          <div class="card-kicker">一起维护这片知识花园。</div>
          <div class="team">
            <VPTeamMembers size="small" :members="creators" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dash {
  --dash-max: 1180px;
  --ink: color-mix(in oklab, var(--vp-c-text-1) 92%, black);
  --muted: color-mix(in oklab, var(--vp-c-text-2) 88%, var(--vp-c-text-1));
  --card: color-mix(in oklab, var(--vp-c-bg) 92%, white);
  --card-2: color-mix(in oklab, var(--vp-c-bg) 86%, white);
  --line: color-mix(in oklab, var(--vp-c-divider) 72%, transparent);
  --brand: var(--vp-c-brand-3);
  --brand-2: var(--dash-accent-b);
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.08);
  --shadow-2: 0 10px 28px rgba(0, 0, 0, 0.12);
  padding: 24px 16px 44px;
}

.hero {
  position: relative;
  max-width: var(--dash-max);
  margin: 0 auto;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: linear-gradient(180deg,
      color-mix(in oklab, var(--vp-c-bg) 88%, white),
      color-mix(in oklab, var(--vp-c-bg) 96%, black));
  box-shadow: var(--shadow);
}

.hero-cover {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 420px at 16% 30%, color-mix(in oklab, var(--brand) 18%, transparent), transparent 60%),
    radial-gradient(700px 520px at 86% 28%, color-mix(in oklab, var(--brand-2) 22%, transparent), transparent 62%),
    linear-gradient(110deg, rgba(10, 30, 36, 0.06), transparent 54%),
    repeating-linear-gradient(135deg, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 10px);
  filter: saturate(1.05);
  transform: translateZ(0);
}

.dark .hero-cover {
  background:
    radial-gradient(980px 460px at 16% 30%, color-mix(in oklab, var(--brand) 12%, transparent), transparent 62%),
    radial-gradient(720px 540px at 86% 28%, color-mix(in oklab, var(--brand-2) 12%, transparent), transparent 64%),
    linear-gradient(110deg, rgba(255, 255, 255, 0.03), transparent 54%),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 12px);
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.5fr 0.85fr;
  gap: 18px;
  padding: 26px;
}

.hero-left {
  padding: 8px 6px 10px 6px;
}

.brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--card) 82%, transparent);
  border: 1px solid var(--line);
  backdrop-filter: blur(10px);
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fff, var(--brand-2));
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 18%, transparent);
}

.brand-name {
  letter-spacing: 0.08em;
  text-transform: lowercase;
  font-weight: 650;
  color: var(--ink);
  opacity: 0.92;
}

.headline {
  margin: 14px 0 10px;
  font-size: clamp(26px, 3.2vw, 40px);
  line-height: 1.12;
  font-weight: 820;
  color: var(--ink);
}

.subline {
  margin: 0 0 16px;
  max-width: 56ch;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  text-decoration: none;
  font-weight: 650;
  font-size: 14px;
  letter-spacing: 0.01em;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
}

.btn.primary {
  color: white;
  border-color: color-mix(in oklab, var(--brand) 60%, transparent);
  background:
    linear-gradient(135deg, color-mix(in oklab, var(--brand) 88%, var(--brand-2)), color-mix(in oklab, var(--brand-2) 92%, var(--brand)));
  box-shadow: 0 10px 22px color-mix(in oklab, var(--brand-2) 26%, transparent);
}

.btn.ghost {
  color: var(--ink);
  background: color-mix(in oklab, var(--card) 72%, transparent);
  backdrop-filter: blur(10px);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}

.btn:active {
  transform: translateY(0);
}

.quick-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.quick {
  display: block;
  padding: 12px 12px 10px;
  border-radius: 16px;
  background: color-mix(in oklab, var(--card-2) 76%, transparent);
  border: 1px solid var(--line);
  text-decoration: none;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
  backdrop-filter: blur(10px);
}

.quick:hover {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--brand) 26%, var(--line));
  background: color-mix(in oklab, var(--card) 82%, transparent);
}

.quick-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.quick-label {
  color: var(--ink);
  font-weight: 760;
  letter-spacing: 0.04em;
  font-size: 13px;
}

.quick-arrow {
  color: color-mix(in oklab, var(--muted) 80%, var(--brand));
  font-weight: 700;
}

.quick-desc {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}

.hero-right {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 12px;
  align-content: start;
}

.widget {
  position: relative;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--card) 76%, transparent);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.clock {
  padding: 14px;
  min-height: 176px;
}

.clock-ring {
  position: absolute;
  inset: -22px;
  background:
    conic-gradient(from 160deg,
      color-mix(in oklab, var(--brand) 82%, transparent),
      color-mix(in oklab, var(--brand-2) 86%, transparent),
      color-mix(in oklab, var(--brand) 76%, transparent));
  opacity: 0.24;
  filter: blur(14px);
}

.clock-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 18px 16px;
  border-radius: 16px;
  background:
    radial-gradient(120px 90px at 20% 30%, rgba(255, 255, 255, 0.72), transparent 68%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.15));
}

.dark .clock-inner {
  background:
    radial-gradient(120px 90px at 20% 30%, rgba(255, 255, 255, 0.08), transparent 68%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
}

.clock-greeting {
  font-weight: 720;
  color: var(--ink);
  opacity: 0.92;
  font-size: 14px;
}

.clock-time {
  margin-top: 6px;
  font-size: 34px;
  font-weight: 860;
  letter-spacing: 0.02em;
  color: var(--ink);
}

.clock-date {
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}

.weather {
  padding: 14px 16px 12px;
}

.weather-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.weather-city {
  font-weight: 750;
  color: var(--ink);
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.weather-place {
  font-weight: 650;
  font-size: 12px;
  color: color-mix(in oklab, var(--muted) 82%, var(--brand));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weather-place.loading {
  opacity: 0.7;
}

.weather-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  background: color-mix(in oklab, var(--card-2) 74%, transparent);
}

.weather-pill.warn {
  color: color-mix(in oklab, #f87171 82%, var(--ink));
  border-color: color-mix(in oklab, #f87171 28%, var(--line));
  background: color-mix(in oklab, #f87171 12%, var(--card-2));
}

.weather-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fff, #fbbf24);
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.18);
}

.weather-temp {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 780;
  color: var(--ink);
}

.weather-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--ink);
  font-size: 12px;
  background: color-mix(in oklab, var(--card) 72%, transparent);
}

.meta-pill.subtle {
  color: var(--muted);
}

.geo {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--card) 72%, transparent);
  color: var(--ink);
  font-weight: 650;
  cursor: pointer;
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
}

.geo:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 26%, var(--line));
  background: color-mix(in oklab, var(--card) 86%, transparent);
}

.geo:active {
  transform: translateY(0);
}

.weather-hint {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
  opacity: 0.85;
}

.below {
  max-width: var(--dash-max);
  margin: 16px auto 0;
}

.cards {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 14px;
}

.card {
  border-radius: 20px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--vp-c-bg) 92%, white);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.06);
  padding: 16px 16px 14px;
  overflow: hidden;
}

.dark .card {
  background: color-mix(in oklab, var(--vp-c-bg) 88%, black);
}

.card.large {
  padding: 18px 18px 16px;
}

.card-title {
  font-weight: 820;
  color: var(--ink);
  letter-spacing: 0.02em;
}

.card-kicker {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.list-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--card) 72%, transparent);
  text-decoration: none;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.list-item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 24%, var(--line));
  background: color-mix(in oklab, var(--card) 86%, transparent);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.03);
}

.dot.ok { background: #22c55e; }
.dot.warn { background: #f59e0b; }
.dot.info { background: #38bdf8; }

.list-text {
  color: var(--ink);
  font-weight: 650;
  font-size: 13px;
}

.list-meta {
  color: var(--muted);
  font-size: 12px;
}

.chips {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: color-mix(in oklab, var(--card) 72%, transparent);
  text-decoration: none;
  color: var(--ink);
  font-weight: 680;
  font-size: 13px;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.chip[data-disabled="true"] {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.chip:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--brand) 26%, var(--line));
  background: color-mix(in oklab, var(--card) 86%, transparent);
}

.card-note {
  margin-top: 10px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.team {
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-right {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .quick-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-grid {
    padding: 18px;
  }

  .hero-right {
    grid-template-columns: 1fr;
  }
}
</style>
