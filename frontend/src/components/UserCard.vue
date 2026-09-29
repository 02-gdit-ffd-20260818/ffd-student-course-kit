<template>
  <div 
    ref="cardElement" 
    class="user-card" 
    @click="handleCardClick"
    @mouseenter="showDetails = true"
    @mouseleave="showDetails = false"
  >
    <div class="user-avatar-container">
      <img 
        :src="user.avatar || defaultAvatar" 
        :alt="user.username" 
        class="user-avatar"
        @error="handleImageError"
      />
      <div class="user-name-overlay">
        <h3 class="user-name">{{ user.name || user.username || '未知用户' }}</h3>
      </div>
      <div class="user-details-overlay" :class="{ active: showDetails }">
        <h3 class="user-name">{{ user.name || user.username || '未知用户' }}</h3>
        <p v-if="user.className" class="user-class">{{ user.className }}</p>
        <p v-if="user.profile?.hometown" class="user-hometown">
          <span class="icon">🏠</span> {{ user.profile.hometown }}
        </p>
        <div v-if="user.profile?.hobbies && user.profile.hobbies.length > 0" class="user-hobbies">
          <span 
            v-for="(hobby, index) in displayHobbies" 
            :key="index" 
            class="hobby-tag"
          >
            {{ hobby }}
          </span>
          <span v-if="user.profile.hobbies.length > 3" class="more-hobbies">
            +{{ user.profile.hobbies.length - 3 }}
          </span>
        </div>
        <p v-if="user.profile?.bio" class="user-bio">{{ truncateText(user.profile.bio, 80) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useOptimizedAnimations } from '../composables/useOptimizedAnimations'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cardElement = ref(null)
const showDetails = ref(false)

// 使用优化的动画
const { animateOnScroll } = useOptimizedAnimations()

// 默认头像
const defaultAvatar = 'https://picsum.photos/seed/default-avatar/200/200.jpg'

// 显示的爱好（最多3个）
const displayHobbies = computed(() => {
  if (!props.user.profile?.hobbies) return []
  return props.user.profile.hobbies.slice(0, 3)
})

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = defaultAvatar
}

// 处理卡片点击
const handleCardClick = () => {
  router.push(`/user/${props.user.email}`)
}

// 组件挂载后添加滚动动画
onMounted(() => {
  nextTick(() => {
    if (cardElement.value) {
      animateOnScroll(cardElement.value)
    }
  })
})
</script>

<style scoped>
.user-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: visible; /* 改为visible，确保放大时不被截断 */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  will-change: transform, box-shadow;
  position: relative;
  z-index: 1;
  transform-origin: center center;
  width: 100%;
  height: 100%;
  margin: 5px; /* 添加外边距，为放大效果留出空间 */
}

.user-card:hover {
  transform: scale(1.08) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  z-index: 20 !important;
}

.user-avatar-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 比例 */
  overflow: hidden;
  border-radius: 15px;
}

.user-avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
}

.user-card:hover .user-avatar {
  transform: scale(1.0); /* 移除照片的额外缩放，让整个卡片统一缩放 */
}

.user-name-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 15px;
  text-align: center;
  transition: opacity 0.3s ease;
}

/* 当鼠标悬停时，隐藏原本显示的名字 */
.user-card:hover .user-name-overlay {
  opacity: 0;
}

.user-details-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 0, 0, 0.4) 100%);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow-y: auto;
}

.user-details-overlay.active {
  opacity: 1;
}

.user-name {
  margin: 0 0 5px 0; /* 增加下边距，与班级信息隔开更多距离 */
  font-size: 18px;
  font-weight: 600;
  color: white;
  opacity: 0.8; /* 设置文字透明度为50% */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* 添加文字阴影，提高可读性 */
}

.user-class {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.user-hometown {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 5px;
}

.user-hobbies {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.hobby-tag {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 12px;
  color: white;
}

.more-hobbies {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.user-bio {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8); /* 修改透明度为80% */
  line-height: 1.4;
}
</style>