/**
 * 获取浏览器的基本信息
 */
export function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        referrer: document.referrer,
        path: location.pathname,
    }
}

// Metrics 指标
export { Metrics } from './integrations/metrics'
