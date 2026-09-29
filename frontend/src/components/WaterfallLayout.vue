<template>
  <div class="waterfall-outer-container">
    <div class="waterfall-container" ref="container">
      <div 
        v-for="(item, index) in items" 
        :key="item.id" 
        class="waterfall-item"
        :style="getItemStyle(index)"
      >
        <slot name="item" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  columnWidth: {
    type: Number,
    default: 280
  },
  gap: {
    type: Number,
    default: 20
  },
  minColumns: {
    type: Number,
    default: 2
  },
  maxColumns: {
    type: Number,
    default: 5
  }
})

const container = ref(null)
const columns = ref(props.minColumns)
const itemHeights = ref([])
const resizeObserver = ref(null)

// 计算列数
const calculateColumns = () => {
  if (!container.value) return props.minColumns
  
  // 获取容器实际宽度（已经通过CSS设置为减去左右边距后的宽度）
  const containerWidth = container.value.clientWidth;
  
  const calculatedColumns = Math.floor((containerWidth + props.gap) / (props.columnWidth + props.gap))
  
  return Math.max(props.minColumns, Math.min(calculatedColumns, props.maxColumns))
}

// 获取项目样式
const getItemStyle = (index) => {
  if (itemHeights.value.length === 0) return {}
  
  const column = index % columns.value
  const row = Math.floor(index / columns.value)
  
  // 计算当前列的高度
  let columnHeight = 0
  for (let i = 0; i < row; i++) {
    const itemIndex = i * columns.value + column
    if (itemIndex < itemHeights.value.length) {
      columnHeight += itemHeights.value[itemIndex] + props.gap
    }
  }
  
  // 获取容器宽度（已经通过CSS设置为减去左右边距后的宽度）
  const containerWidth = container.value ? container.value.clientWidth : 0;
  
  // 计算项目宽度和间隙
  const totalGapWidth = (columns.value - 1) * props.gap;
  const itemWidth = (containerWidth - totalGapWidth) / columns.value;
  
  // 计算剩余空间并居中
  const totalContentWidth = columns.value * itemWidth + totalGapWidth;
  const remainingSpace = containerWidth - totalContentWidth;
  const leftOffset = remainingSpace / 2; // 在容器内居中
  
  return {
    position: 'absolute',
    width: `${itemWidth}px`,
    left: `${leftOffset + column * (itemWidth + props.gap)}px`,
    top: `${columnHeight}px`,
    zIndex: index % columns.value === 0 ? 2 : 1 // 为第一列的项目设置更高的z-index
  }
}

// 更新容器高度
const updateContainerHeight = () => {
  if (!container.value || itemHeights.value.length === 0) return
  
  const columnHeights = new Array(columns.value).fill(0)
  
  itemHeights.value.forEach((height, index) => {
    const column = index % columns.value
    columnHeights[column] += height + props.gap
  })
  
  const maxHeight = Math.max(...columnHeights)
  container.value.style.height = `${maxHeight}px`
}

// 更新项目高度
const updateItemHeights = async () => {
  if (!container.value) return
  
  await nextTick()
  
  const items = container.value.querySelectorAll('.waterfall-item')
  const heights = Array.from(items).map(item => {
    // 获取项目的实际高度，不包括绝对定位
    const content = item.querySelector('.user-card')
    return content ? content.offsetHeight : 200 // 默认高度
  })
  
  itemHeights.value = heights
  updateContainerHeight()
}

// 窗口大小变化处理
const handleResize = () => {
  columns.value = calculateColumns()
  updateItemHeights()
}

// 监听项目变化
watch(() => props.items, () => {
  nextTick(() => {
    updateItemHeights()
  })
}, { deep: true })

onMounted(() => {
  columns.value = calculateColumns()
  
  // 使用ResizeObserver监听容器大小变化
  if (window.ResizeObserver) {
    resizeObserver.value = new ResizeObserver(handleResize)
    resizeObserver.value.observe(container.value)
  } else {
    // 回退到window resize事件
    window.addEventListener('resize', handleResize)
  }
  
  // 初始化项目高度
  nextTick(() => {
    updateItemHeights()
  })
})

onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  } else {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.waterfall-outer-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto; /* 确保外层容器可以滚动 */
  overflow-x: hidden;
  padding: 20px 0; /* 添加上下内边距，为放大效果留出空间 */
}

.waterfall-container {
  position: relative;
  width: calc(100% - 160px); /* 减去左右各80px的边距 */
  height: auto; /* 改为自动高度 */
  margin: 0 auto; /* 水平居中 */
  overflow: visible; /* 改为可见，允许内容溢出 */
  padding: 20px; /* 添加内边距，为放大效果留出空间 */
}

.waterfall-item {
  transition: all 0.3s ease;
  z-index: 1;
  overflow: visible;
  margin: 10px; /* 添加外边距，为放大效果留出空间 */
}

.waterfall-item:hover {
  z-index: 10;
  overflow: visible;
}

.waterfall-item:hover .user-card {
  transform: scale(1.08) !important;
}
</style>