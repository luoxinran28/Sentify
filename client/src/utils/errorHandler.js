// 忽略特定类型的错误消息
const IGNORED_ERRORS = [
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded',
  'ResizeObserver could not deliver all observations',
  'Script error.',  // 跨域脚本错误
  'ChunkLoadError',  // 代码分割加载错误
];

// 错误计数器
const errorCounter = {
  count: 0,
  lastReset: Date.now(),
  resetInterval: 180000, // 3分钟重置一次
};

// 重置错误计数器
const resetErrorCounter = () => {
  const now = Date.now();
  if (now - errorCounter.lastReset > errorCounter.resetInterval) {
    errorCounter.count = 0;
    errorCounter.lastReset = now;
  }
};

// 检查是否应该忽略错误
const shouldIgnoreError = (message = '') => {
  return IGNORED_ERRORS.some(ignored => 
    message.toLowerCase().includes(ignored.toLowerCase())
  );
};

// 全局错误处理函数
export const handleGlobalError = (message, source, lineno, colno, error) => {
  // 检查是否为需要忽略的错误
  if (shouldIgnoreError(message)) {
    return true;
  }

  // 更新错误计数
  resetErrorCounter();
  errorCounter.count++;

  // 如果错误太频繁，只记录不显示
  if (errorCounter.count > 5) {
    console.debug('Suppressed error:', { message, source, lineno, colno, error });
    return true;
  }

  // 其他错误的处理逻辑
  console.error('Global error:', {
    message,
    source,
    lineno,
    colno,
    error
  });

  return false; // 允许默认的错误处理
};

// ResizeObserver 错误处理
export const setupResizeObserverError = () => {
  if (!window.ResizeObserver) return;

  const originalResizeObserver = window.ResizeObserver;
  
  window.ResizeObserver = class ResizeObserver extends originalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        // 使用 requestAnimationFrame 来限制回调频率
        window.requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (e) {
            if (!shouldIgnoreError(e.message)) {
              console.error('ResizeObserver callback error:', e);
            }
          }
        });
      });
      this.retryCount = 0;
    }
    
    observe(target, options) {
      try {
        super.observe(target, options);
      } catch (e) {
        if (this.retryCount < 3) {
          this.retryCount++;
          setTimeout(() => {
            this.observe(target, options);
          }, 100 * this.retryCount); // 递增重试延迟
        } else if (!shouldIgnoreError(e.message)) {
          console.warn('ResizeObserver failed to observe:', target, e);
        }
      }
    }

    unobserve(target) {
      try {
        super.unobserve(target);
      } catch (e) {
        if (!shouldIgnoreError(e.message)) {
          console.warn('ResizeObserver failed to unobserve:', target, e);
        }
      }
    }
  };
};

// 全局错误处理
export const setupGlobalErrorHandlers = () => {
  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldIgnoreError(event.reason?.message)) {
      event.preventDefault();
      return;
    }
    
    console.error('Unhandled promise rejection:', event.reason);
  });

  // 处理常规的 JavaScript 错误
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError(event.error?.message)) {
      event.preventDefault();
      return;
    }

    // 忽略 Chrome 扩展相关错误
    if (event.filename?.includes('chrome-extension://')) {
      event.preventDefault();
      return;
    }

    console.error('Global error:', event.error);
  });

  // 覆盖默认的 console.error
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args.some(arg => shouldIgnoreError(
      arg?.message || String(arg)
    ))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // 添加性能监控
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) { // 记录超过100ms的长任务
            console.debug('Long task detected:', entry);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.debug('PerformanceObserver setup failed:', e);
    }
  }
}; 