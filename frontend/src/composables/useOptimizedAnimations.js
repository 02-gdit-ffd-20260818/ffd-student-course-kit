import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  detectDevicePerformance, 
  getOptimizedAnimationConfig,
  OptimizedTransition,
  ScrollAnimation,
  LoadingAnimation,
  debounce,
  throttle
} from '../utils/animationOptimization'
import animationPerformanceMonitor from '../utils/performanceMonitor'

// 优化的动画组合式函数
export function useOptimizedAnimations() {
  const devicePerformance = ref(detectDevicePerformance())
  const animationConfig = ref(getOptimizedAnimationConfig())
  const scrollAnimations = ref([])
  const loadingAnimations = ref([])
  
  // 优化的过渡动画
  const createTransition = (element, properties, options = {}) => {
    // 记录动画开始
    const startTime = performance.now()
    const animationName = options.name || 'transition'
    
    // 监控动画性能
    if (process.env.NODE_ENV === 'development') {
      animationPerformanceMonitor.observeElementAnimation(element, animationName)
    }
    
    const transition = new OptimizedTransition(element, properties, { ...animationConfig.value, ...options })
    
    // 监听动画完成以记录性能
    const originalComplete = transition.complete || (() => {})
    transition.complete = () => {
      const endTime = performance.now()
      const animationDuration = endTime - startTime
      
      if (process.env.NODE_ENV === 'development') {
        animationPerformanceMonitor.recordAnimationDuration(animationName, animationDuration)
      }
      
      originalComplete()
    }
    
    return transition
  }
  
  // 创建滚动动画
  const createScrollAnimation = (elements, options = {}) => {
    const scrollAnimation = new ScrollAnimation(elements, { ...animationConfig.value, ...options })
    scrollAnimations.value.push(scrollAnimation)
    return scrollAnimation
  }
  
  // 创建加载动画
  const createLoadingAnimation = (element, options = {}) => {
    const loadingAnimation = new LoadingAnimation(element, { ...animationConfig.value, ...options })
    loadingAnimations.value.push(loadingAnimation)
    return loadingAnimation
  }
  
  // 优化的滚动事件处理
  const createScrollHandler = (callback, options = {}) => {
    const { leading = false, trailing = true } = options
    return throttle(callback, 16, { leading, trailing }) // 约60fps
  }
  
  // 优化的调整大小事件处理
  const createResizeHandler = (callback) => {
    return debounce(callback, 150)
  }
  
  // 优化的元素进入视口动画
  const animateOnScroll = (elements, options = {}) => {
    nextTick(() => {
      const elementsArray = Array.isArray(elements) ? elements : [elements]
      const validElements = elementsArray.filter(el => el)
      
      if (validElements.length === 0) return
      
      // 初始状态
      validElements.forEach(el => {
        el.style.opacity = '0'
        el.style.transform = 'translate3d(0, 20px, 0)'
      })
      
      // 创建观察器
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.transition = `opacity ${animationConfig.value.duration}s ${animationConfig.value.easing}, transform ${animationConfig.value.duration}s ${animationConfig.value.easing}`
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translate3d(0, 0, 0)'
            observer.unobserve(entry.target)
          }
        })
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      })
      
      // 观察元素
      validElements.forEach(el => observer.observe(el))
      
      // 保存观察器以便清理
      scrollAnimations.value.push({ destroy: () => observer.disconnect() })
    })
  }
  
  // 优化的列表项动画
  const animateListItems = (container, items, options = {}) => {
    const { stagger = 100, initialDelay = 0 } = options
    
    nextTick(() => {
      items.forEach((item, index) => {
        item.style.opacity = '0'
        item.style.transform = 'translate3d(20px, 0, 0)'
        
        setTimeout(() => {
          item.style.transition = `opacity ${animationConfig.value.duration}s ${animationConfig.value.easing}, transform ${animationConfig.value.duration}s ${animationConfig.value.easing}`
          item.style.opacity = '1'
          item.style.transform = 'translate3d(0, 0, 0)'
        }, initialDelay + index * stagger)
      })
    })
  }
  
  // 优化的模态框动画
  const animateModal = (modalElement, isVisible, options = {}) => {
    if (!modalElement) return
    
    const duration = options.duration || animationConfig.value.duration
    const easing = options.easing || animationConfig.value.easing
    
    if (isVisible) {
      modalElement.style.opacity = '0'
      modalElement.style.transform = 'scale(0.9)'
      modalElement.style.display = 'flex'
      
      // 强制重排
      modalElement.offsetHeight
      
      modalElement.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`
      modalElement.style.opacity = '1'
      modalElement.style.transform = 'scale(1)'
    } else {
      modalElement.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`
      modalElement.style.opacity = '0'
      modalElement.style.transform = 'scale(0.9)'
      
      setTimeout(() => {
        modalElement.style.display = 'none'
      }, duration * 1000)
    }
  }
  
  // 优化的页面过渡
  const animatePageTransition = (enterElement, leaveElement, direction = 'forward') => {
    return new Promise(resolve => {
      const duration = animationConfig.value.duration
      
      // 设置初始状态
      if (enterElement) {
        if (direction === 'forward') {
          enterElement.style.transform = 'translate3d(100%, 0, 0)'
        } else {
          enterElement.style.transform = 'translate3d(-100%, 0, 0)'
        }
        enterElement.style.opacity = '0'
        enterElement.style.transition = `transform ${duration}s ${animationConfig.value.easing}, opacity ${duration}s ${animationConfig.value.easing}`
      }
      
      if (leaveElement) {
        leaveElement.style.transition = `transform ${duration}s ${animationConfig.value.easing}, opacity ${duration}s ${animationConfig.value.easing}`
      }
      
      // 强制重排
      document.body.offsetHeight
      
      // 开始动画
      if (enterElement) {
        enterElement.style.transform = 'translate3d(0, 0, 0)'
        enterElement.style.opacity = '1'
      }
      
      if (leaveElement) {
        if (direction === 'forward') {
          leaveElement.style.transform = 'translate3d(-100%, 0, 0)'
        } else {
          leaveElement.style.transform = 'translate3d(100%, 0, 0)'
        }
        leaveElement.style.opacity = '0'
      }
      
      // 动画完成后解析
      setTimeout(resolve, duration * 1000)
    })
  }
  
  // 清理所有动画
  const cleanupAnimations = () => {
    scrollAnimations.value.forEach(animation => {
      if (typeof animation.destroy === 'function') {
        animation.destroy()
      }
    })
    
    loadingAnimations.value.forEach(animation => {
      if (typeof animation.stop === 'function') {
        animation.stop()
      }
    })
    
    scrollAnimations.value = []
    loadingAnimations.value = []
  }
  
  // 获取性能报告
  const getPerformanceReport = () => {
    if (process.env.NODE_ENV === 'development') {
      return animationPerformanceMonitor.getPerformanceReport()
    }
    return null
  }
  
  // 检测性能问题
  const detectPerformanceIssues = () => {
    if (process.env.NODE_ENV === 'development') {
      return animationPerformanceMonitor.detectPerformanceIssues()
    }
    return []
  }
  
  // 组件卸载时清理
  onUnmounted(() => {
    cleanupAnimations()
    if (process.env.NODE_ENV === 'development') {
      animationPerformanceMonitor.stopMonitoring()
    }
  })
  
  return {
    devicePerformance,
    animationConfig,
    createTransition,
    createScrollAnimation,
    createLoadingAnimation,
    createScrollHandler,
    createResizeHandler,
    animateOnScroll,
    animateListItems,
    animateModal,
    animatePageTransition,
    cleanupAnimations,
    getPerformanceReport,
    detectPerformanceIssues
  }
}

// 优化的加载状态管理
export function useOptimizedLoading(initialState = false) {
  const isLoading = ref(initialState)
  const loadingElement = ref(null)
  let loadingAnimation = null
  
  const startLoading = (element) => {
    isLoading.value = true
    loadingElement.value = element
    
    if (element) {
      loadingAnimation = new LoadingAnimation(element)
      loadingAnimation.start()
    }
  }
  
  const stopLoading = () => {
    isLoading.value = false
    
    if (loadingAnimation) {
      loadingAnimation.stop()
      loadingAnimation = null
    }
    
    if (loadingElement.value) {
      loadingElement.value.style.opacity = '0'
    }
  }
  
  onUnmounted(() => {
    if (loadingAnimation) {
      loadingAnimation.stop()
    }
  })
  
  return {
    isLoading,
    loadingElement,
    startLoading,
    stopLoading
  }
}