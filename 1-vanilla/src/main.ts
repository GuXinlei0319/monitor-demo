import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

import {
  init,
  browserTracingIntegration,
  breadcrumbsIntegration,
  browserApiErrorsIntegration
} from "@sentry/browser"

init({
  dsn: "https://7f09a4b8c261c602e75612b340e8c5bc@o4509921884045312.ingest.us.sentry.io/4509922128887808",
  integrations: [
    browserTracingIntegration(),  // 监控性能
    breadcrumbsIntegration(), // 监控常规报错
    browserApiErrorsIntegration(), // 监控promise
  ], // 插件化设计
})

// js 常见错误
// aaa  // 变量报错
// fetch('https://baidu.com') promise 报错
Promise.reject('https://baidu.com')
// 安装 @sentry/borwser 浏览器原生版本





document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
