<template>
  <div class="background">
    <img
      v-if="currentImage && !currentImage.isBase64"
      alt="background"
      :src="currentImage.url"
      :key="currentImage.url"
      @load="imgLoadComplete"
      @error="imgLoadError"
      v-show="imgShow"
      ref="bgImage"
    />
    <!-- 对于base64图片，使用div的background-image属性，避免HTTP请求头过大问题 -->
    <div
      v-if="currentImage && currentImage.isBase64"
      class="background-base64"
      :style="{ backgroundImage: `url(${currentImage.url})` }"
      v-show="imgShow"
      @load="imgLoadComplete"
    ></div>
    <div v-show="!imgShow" class="loading">
      <div class="loading-box">
        <span class="loading-text">加载中</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';

// 防抖函数
const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const props = defineProps({
  // 图片列表
  imgList: {
    type: Array,
    default: () => [],
  },
  // 当前背景图片索引
  currentIndex: {
    type: Number,
    default: 0,
  },
  // 是否随机更换背景
  randomBackground: {
    type: Boolean,
    default: false,
  },
  // 自定义背景图片URL
  customBackgroundUrl: {
    type: String,
    default: '',
  }
});

// 图片加载状态
const imgShow = ref(false);
const imgLoadTimeout = ref(null);
const bgImage = ref(null);
const isChanging = ref(false); // 添加状态标记，防止频繁切换

// 当前显示的图片
const currentImage = computed(() => {
  // 如果有自定义背景图片，优先使用
  if (props.customBackgroundUrl) {
    // 对于base64图片，进行特殊处理
    if (props.customBackgroundUrl.startsWith('data:')) {
      return { 
        url: props.customBackgroundUrl,
        isBase64: true
      };
    }
    return { url: props.customBackgroundUrl };
  }
  
  // 如果没有图片列表，返回null
  if (!props.imgList || props.imgList.length === 0) {
    return null;
  }
  
  // 如果是随机模式，返回指定索引的图片（避免每次计算都重新生成随机数）
  if (props.randomBackground) {
    return props.imgList[props.currentIndex] || props.imgList[0];
  }
  
  // 否则返回指定索引的图片
  return props.imgList[props.currentIndex] || props.imgList[0];
});

// 图片加载完成
const imgLoadComplete = () => {
  console.log("背景图片加载成功:", currentImage.value?.url);
  if (imgLoadTimeout.value) {
    clearTimeout(imgLoadTimeout.value);
    imgLoadTimeout.value = null;
  }
  imgShow.value = true;
  isChanging.value = false; // 重置状态
};

// 图片加载失败
const imgLoadError = () => {
  console.warn('图片加载失败:', currentImage.value?.url);
  
  if (imgLoadTimeout.value) {
    clearTimeout(imgLoadTimeout.value);
    imgLoadTimeout.value = null;
  }
  
  // 如果是base64图片，直接显示错误信息，不需要重试
  if (currentImage.value?.url && currentImage.value.url.startsWith('data:')) {
    console.error('Base64图片加载失败，可能是数据格式问题');
    // 设置默认背景色
    document.body.style.backgroundColor = "#333";
    imgShow.value = true;
    isChanging.value = false;
    return;
  }
  
  // 尝试使用绝对路径重试加载
  if (currentImage.value && bgImage.value) {

    const absoluteUrl = currentImage.value.url.startsWith('/') 
      ? currentImage.value.url 
      : '/' + currentImage.value.url;
    
    // 创建新的图片对象进行预加载
    const retryImg = new Image();
    retryImg.onload = () => {
      console.log("重试加载成功:", absoluteUrl);
      bgImage.value.src = absoluteUrl;
      imgShow.value = true;
      isChanging.value = false;
    };
    retryImg.onerror = () => {
      console.error("重试加载也失败了:", absoluteUrl);
      // 设置默认背景色
      document.body.style.backgroundColor = "#333";
      imgShow.value = true;
      isChanging.value = false;
    };
    retryImg.src = absoluteUrl;
  } else {
    // 设置默认背景色
    document.body.style.backgroundColor = "#333";
    imgShow.value = true;
    isChanging.value = false;
  }
};

// 清理资源
const cleanupResources = () => {
  // 清理当前图片资源
  if (bgImage.value) {
    bgImage.value.src = '';
    // 释放图片元素引用
    bgImage.value.onload = null;
    bgImage.value.onerror = null;
  }
  
  // 清理可能存在的其他图片资源
  const images = document.querySelectorAll('.background img');
  images.forEach((img) => {
    if (img !== bgImage.value) {
      img.src = '';
      img.onload = null;
      img.onerror = null;
      img.remove();
    }
  });
  
  // 清理可能的canvas元素（WebGL上下文的来源）
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (ctx) {
      // 释放WebGL上下文
      const loseContext = ctx.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }
  });
};

// 初始化
onMounted(() => {
  // 如果没有图片，设置默认背景
  if (!props.imgList || props.imgList.length === 0) {
    document.body.style.backgroundColor = "#333";
    imgShow.value = true;
  } else {
    // 如果是base64图片，直接显示
    if (currentImage.value && currentImage.value.isBase64) {
      console.log("初始化加载base64背景图片");
      // 给浏览器一些时间渲染
      setTimeout(() => {
        imgShow.value = true;
        isChanging.value = false;
      }, 100);
      return;
    }
    
    // 设置超时，5秒后强制显示内容
    imgLoadTimeout.value = setTimeout(() => {
      console.warn("初始背景图片加载超时，强制显示内容");
      imgShow.value = true;
      imgLoadTimeout.value = null;
      isChanging.value = false;
    }, 5000);
    
    // 初始化时直接触发背景变化处理，确保图片加载
    console.log("组件初始化，触发背景图片加载");
    handleBackgroundChange();
  }
});

// 监听背景变化，重新加载图片
const handleBackgroundChange = debounce(() => {
  // 如果正在切换中，则忽略此次变化
  if (isChanging.value) return;
  
  isChanging.value = true;
  imgShow.value = false;
  
  // 清理之前的资源
  cleanupResources();
  
  // 清除之前的超时
  if (imgLoadTimeout.value) {
    clearTimeout(imgLoadTimeout.value);
  }
  
  // 如果是base64图片，直接显示，不需要超时处理
  if (currentImage.value && currentImage.value.isBase64) {
    console.log("加载base64背景图片");
    // 给浏览器一些时间渲染
    setTimeout(() => {
      imgShow.value = true;
      isChanging.value = false;
    }, 100);
    return;
  }
  
  // 设置新的超时，5秒后强制显示内容
  imgLoadTimeout.value = setTimeout(() => {
    console.warn("背景图片加载超时，强制显示内容");
    imgShow.value = true;
    imgLoadTimeout.value = null;
    isChanging.value = false;
  }, 5000);
}, 300); // 300ms防抖延迟

// 监听背景变化
watch(() => [props.currentIndex, props.randomBackground, props.customBackgroundUrl], handleBackgroundChange);

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupResources();
  if (imgLoadTimeout.value) {
    clearTimeout(imgLoadTimeout.value);
  }
});
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.background img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-size: cover;
  background-position: center;
  transition: opacity 1s ease-in-out;
  filter: blur(20px) brightness(0.3);
}

.background-base64 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 1s ease-in-out;
  filter: blur(20px) brightness(0.3);
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-text {
  font-family: "UnidreamLED";
  font-size: 2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>