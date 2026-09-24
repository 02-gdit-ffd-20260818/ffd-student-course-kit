// 全局动画优化工具
// 提供性能优化的动画类和方法

// 性能检测结果在整个页面内只计算一次。
// 旧版本每个 UserCard 都会创建一个 WebGL context，照片墙用户较多时会触发浏览器上限。
let devicePerformanceCache = null;

// 检测设备性能能力
export const detectDevicePerformance = () => {
  if (devicePerformanceCache) {
    return devicePerformanceCache;
  }

  let supportsWebGL = false;

  // 只创建一次探测 context，并在探测后主动释放，避免组件数量增加时持续占用 GPU 资源。
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    let gl = null;

    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      supportsWebGL = !!gl;
    } catch (error) {
      console.warn('WebGL 能力检测失败，将使用普通 CSS 动画:', error);
    } finally {
      const loseContext = gl?.getExtension?.('WEBGL_lose_context');
      loseContext?.loseContext();
    }
  }

  const isLowEndDevice = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 2) ||
                        (typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 2) ||
                        (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  devicePerformanceCache = Object.freeze({
    isLowEndDevice,
    supportsWebGL,
    supportsWillChange: typeof document !== 'undefined' && 'will-change' in document.body.style,
    supportsReducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });

  return devicePerformanceCache;
};

// 优化的动画配置
export const getOptimizedAnimationConfig = (devicePerformance = detectDevicePerformance()) => {
  
  return {
    // 根据设备性能调整动画设置
    duration: devicePerformance.isLowEndDevice ? 0.2 : 0.3,
    easing: devicePerformance.isLowEndDevice ? 'ease-out' : 'cubic-bezier(0.4, 0, 0.2, 1)',
    reducedMotion: devicePerformance.supportsReducedMotion,
    // 优先使用transform和opacity，这些属性不会触发重排
    safeProperties: ['transform', 'opacity'],
    // 避免使用的属性
    avoidProperties: ['width', 'height', 'left', 'top', 'margin', 'padding']
  };
};

// 优化的过渡类
export class OptimizedTransition {
  constructor(element, properties, options = {}) {
    this.element = element;
    this.properties = properties;
    this.config = { ...getOptimizedAnimationConfig(), ...options };
    this.startTime = null;
    this.animationId = null;
  }
  
  start() {
    if (this.config.reducedMotion) {
      // 如果用户偏好减少动画，立即应用最终状态
      this.applyFinalState();
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      // 设置will-change以优化性能
      this.element.style.willChange = this.properties.join(', ');
      
      // 使用requestAnimationFrame确保动画与浏览器刷新率同步
      this.startTime = performance.now();
      this.animate(resolve);
    });
  }
  
  animate(resolve) {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / (this.config.duration * 1000), 1);
    
    // 应用动画
    this.applyAnimation(progress);
    
    if (progress < 1) {
      this.animationId = requestAnimationFrame(() => this.animate(resolve));
    } else {
      // 动画完成，清理
      this.cleanup();
      resolve();
    }
  }
  
  applyAnimation(progress) {
    // 使用缓动函数计算当前值
    const easedProgress = this.easing(progress);
    
    this.properties.forEach(property => {
      if (property === 'opacity') {
        this.element.style.opacity = easedProgress;
      } else if (property === 'transform') {
        // 根据需要应用不同的transform
        this.element.style.transform = this.getTransform(easedProgress);
      }
    });
  }
  
  getTransform(progress) {
    // 默认使用简单的translateY，可以根据需要扩展
    return `translateY(${(1 - progress) * 20}px)`;
  }
  
  easing(t) {
    // 简单的ease-out实现
    return 1 - Math.pow(1 - t, 3);
  }
  
  applyFinalState() {
    this.properties.forEach(property => {
      if (property === 'opacity') {
        this.element.style.opacity = 1;
      } else if (property === 'transform') {
        this.element.style.transform = 'translateY(0)';
      }
    });
  }
  
  cleanup() {
    // 清理will-change以释放资源
    this.element.style.willChange = '';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// 优化的滚动动画
export class ScrollAnimation {
  constructor(elements, options = {}) {
    this.elements = elements;
    this.config = { ...getOptimizedAnimationConfig(), ...options };
    this.observer = null;
    this.init();
  }
  
  init() {
    if (this.config.reducedMotion) {
      // 如果用户偏好减少动画，直接显示所有元素
      this.elements.forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      });
      return;
    }
    
    // 初始状态
    this.elements.forEach(el => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity ${this.config.duration}s ${this.config.easing}, transform ${this.config.duration}s ${this.config.easing}`;
    });
    
    // 使用Intersection Observer实现滚动触发动画
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    this.elements.forEach(el => this.observer.observe(el));
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 优化的加载动画
export class LoadingAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.config = { ...getOptimizedAnimationConfig(), ...options };
    this.animationId = null;
    this.rotation = 0;
  }
  
  start() {
    if (this.config.reducedMotion) {
      // 如果用户偏好减少动画，显示静态加载指示器
      this.element.style.opacity = 1;
      return;
    }
    
    this.element.style.opacity = 1;
    this.animate();
  }
  
  animate() {
    this.rotation += 5;
    this.element.style.transform = `rotate(${this.rotation}deg)`;
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.element.style.opacity = 0;
    }
  }
}

// 防抖函数，优化频繁触发的事件
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 节流函数，优化连续事件
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 批量DOM操作优化
export function batchDOMUpdate(callback) {
  // 使用requestAnimationFrame确保DOM更新在下一帧执行
  requestAnimationFrame(() => {
    // 暂时隐藏元素以避免重排
    const element = document.body;
    element.style.display = 'none';
    
    // 执行DOM操作
    callback();
    
    // 恢复显示
    element.style.display = '';
  });
}
