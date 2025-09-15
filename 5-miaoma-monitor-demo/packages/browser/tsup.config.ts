import { defineConfig } from 'tsup'

// 使用数组，可以保证输出产物可以适配多种不同的模块化规范,commonjs,esm,umd
export default defineConfig([
    {
        entry: ['src'],
        format: ['cjs'],
        outDir: 'build/cjs',
    },
    {
        entry: ['src'],
        format: ['esm'],
        outDir: 'build/esm',
    },
    {
        entry: ['src'],
        format: ['iife'],
        outDir: 'build/umd',
        name:'miaoma-monitor-sdk-browser'
    }
])