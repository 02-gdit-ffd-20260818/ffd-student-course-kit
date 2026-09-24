<template>
  <div ref="photoWallElement" class="photo-wall-container">
    <div class="glass-card">
      <div class="header-section">
        <div class="header-left">
          <button @click="goBack" class="back-button">
            <span class="back-icon">←</span>
            返回
          </button>
          <h2>班级照片墙</h2>
        </div>
        <div class="filter-controls">
          <select v-model="selectedClassId" class="glass-input">
            <option 
              v-for="option in classOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <button @click="refreshData" class="refresh-button" :disabled="isLoading">
            <span class="refresh-icon" :class="{ rotating: isLoading }">🔄</span>
            {{ isLoading ? '加载中...' : '刷新' }}
          </button>
        </div>
      </div>
      
      <div v-if="isLoading && (!filteredUsers || filteredUsers.length === 0)" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载用户数据...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="refreshData" class="glass-button small">重试</button>
      </div>
      
      <div v-else-if="!filteredUsers || filteredUsers.length === 0" class="empty-state">
        <p>暂无用户数据</p>
      </div>
      
      <WaterfallLayout v-else :items="filteredUsers" class="photo-wall">
        <template #item="{ item }">
          <UserCard :user="item" />
        </template>
      </WaterfallLayout>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useClassStore } from '../stores/class'
import { useOptimizedAnimations } from '../composables/useOptimizedAnimations'
import WaterfallLayout from '../components/WaterfallLayout.vue'
import UserCard from '../components/UserCard.vue'

const userStore = useUserStore()
const classStore = useClassStore()
const router = useRouter()
const photoWallElement = ref(null)

// 使用优化的动画
const { animateOnScroll, createTransition } = useOptimizedAnimations()

// 初始化数据
onMounted(async () => {
  await Promise.all([
    userStore.fetchOtherUsers(),
    classStore.fetchClasses()
  ])
  
  // 初始化动画
  nextTick(() => {
    if (photoWallElement.value) {
      animateOnScroll(photoWallElement.value)
    }
  })
})

// 计算属性
const isLoading = computed(() => userStore.isLoading || classStore.isLoading)
const error = computed(() => userStore.error || classStore.error)
const filteredUsers = computed(() => {
  if (!selectedClassId.value) {
    return userStore.otherUsers
  }
  return userStore.otherUsers.filter(user => user.classId === selectedClassId.value)
})
const classOptions = computed(() => {
  const options = [{ value: '', label: '全部班级' }]
  classStore.classes.forEach(cls => {
    options.push({ value: cls.id, label: cls.name })
  })
  return options
})
const selectedClassId = ref('')

// 刷新数据
const refreshData = () => {
  Promise.all([
    userStore.fetchOtherUsers(),
    classStore.fetchClasses()
  ])
}

// 回退功能
const goBack = () => {
  router.push('/home')
}
</script>

<style scoped>
.photo-wall-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding: 0;
  z-index: 1;
  overflow: hidden; /* 确保外层容器不滚动 */
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 0;
  padding: 20px;
  border: none;
  box-shadow: none;
  width: 100%;
  height: 100vh; /* 改为视口高度 */
  margin: 0;
  will-change: transform;
  transform: translateZ(0);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 确保glass-card本身不滚动 */
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  will-change: transform;
  transform: translateZ(0);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translate3d(0, -1px, 0);
}

.back-button:active {
  transform: translate3d(0, 0, 0);
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

h2 {
  color: white;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.filter-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.glass-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px 15px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  min-width: 150px;
}

/* 修复下拉菜单选项的显示问题 */
.glass-input option {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

/* 确保下拉菜单在展开时文字可见 */
.glass-input:focus {
  color: white;
}

.glass-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.refresh-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  justify-content: center;
  will-change: transform;
  transform: translateZ(0);
}

.refresh-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translate3d(0, -1px, 0);
}

.refresh-button:active:not(:disabled) {
  transform: translate3d(0, 0, 0);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
  will-change: transform;
}

.refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
  will-change: transform;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
}

.photo-wall {
  flex: 1;
  margin: 20px 0;
  overflow-y: auto; /* 改为自动滚动 */
  overflow-x: hidden;
  position: relative;
  height: calc(100vh - 200px); /* 设置固定高度，留出头部空间 */
  padding: 20px; /* 添加内边距，为放大效果留出空间 */
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .glass-input {
    width: 100%;
  }
}
</style>