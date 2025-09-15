import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'personal-mni', //你的 sentry组织
      project: 'javascript-react', // 你的 sentry 项目 slug
      authToken: "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", // process.env.SENTRY_AUTH_TOKEN sentry 验证身份的token
      // include: './dist', // 指定上传的文件夹
      // urlPrefix: '~/dist', // sourcemap 的路径前缀
      // sourcemaps: {
      //   filesToDeleteAfterUpload: ['./dist/**/*.js.map'], // 上传后删除 sourcemap文件
      // }
    })],
  build: {
    sourcemap: true
  },
})
