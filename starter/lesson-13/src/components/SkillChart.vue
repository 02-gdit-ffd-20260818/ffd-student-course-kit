<script setup>
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { aggregateSkills } from '../domain/member.js'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({ members: { type: Array, required: true } })
const chartEl = ref(null)
const data = computed(() => aggregateSkills(props.members))
let chart

function option() {
  return {
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    grid: { top: 20, right: 24, bottom: 70, left: 42 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => `${value} 人` },
    xAxis: {
      type: 'category',
      data: data.value.map((item) => item.name),
      axisLabel: { interval: 0, rotate: data.value.length > 7 ? 34 : 0, color: '#33463c' },
      axisLine: { lineStyle: { color: '#9da99f' } },
    },
    yAxis: { type: 'value', minInterval: 1, name: '人数', axisLabel: { color: '#33463c' } },
    series: [{
      name: '成员人数',
      type: 'bar',
      data: data.value.map((item) => item.count),
      itemStyle: { color: '#244938', borderRadius: [6, 6, 0, 0] },
      emphasis: { itemStyle: { color: '#f07b3f' } },
    }],
  }
}

function renderChart() {
  if (!chartEl.value) return
  chart ??= echarts.init(chartEl.value)
  chart.setOption(option(), true)
}

function resize() { chart?.resize() }

onMounted(() => {
  renderChart()
  window.addEventListener('resize', resize)
})

watch(data, async () => {
  await nextTick()
  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <section class="chart-card" aria-labelledby="skill-chart-title">
    <div class="chart-heading">
      <div>
        <p class="eyebrow">LIVE AGGREGATION</p>
        <h2 id="skill-chart-title">当前结果的技能分布</h2>
      </div>
      <p>图表与成员列表来自同一份筛选结果。</p>
    </div>
    <div v-if="data.length" ref="chartEl" class="chart" role="img" :aria-label="`技能分布柱状图，共 ${data.length} 个技能类别`"></div>
    <div v-else class="chart-empty" role="status">当前条件没有可聚合的技能数据。</div>
    <p v-if="data.length" class="chart-summary">
      文本摘要：<span v-for="(item, index) in data" :key="item.name">{{ item.name }} {{ item.count }} 人{{ index < data.length - 1 ? '；' : '。' }}</span>
    </p>
  </section>
</template>
