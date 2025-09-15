import { onFCP, onINP, onCLS, onLCP, onTTFB } from "web-vitals";

// performance api 来自定义一些指标
// FMP

function onLoad(callback: (metric: any) => void) {
  // 获取当前导航条数
  const navigationEntries = performance.getEntriesByType("navigation");

  // 如果存在导航条目，取第一个
  if (navigationEntries.length > 0) {
    const entry = navigationEntries[0] as PerformanceNavigationTiming;

    // 计算页面加载时长
    let loadTime = entry ? entry.loadEventEnd - entry.startTime : 10;

    // 确保 loadTime 不为 0 或负数
    if (loadTime <= 0) {
      // 尝试使用其他方法计算加载时间
      loadTime = performance.now();
    }

    // 执行回调函数
    callback({ name: "LOAD", value: loadTime });
  } else {
    // 如果没有导航条目，使用 performance.now() 作为备选
    const loadTime = performance.now();

    callback({ name: "LOAD", value: loadTime });
  }
}

function sendToAnalytics(metric: any) {
  console.log(metric);
}

[onFCP, onINP, onCLS, onLCP, onTTFB, onLoad].forEach((metric) => {
  metric(sendToAnalytics);
});
