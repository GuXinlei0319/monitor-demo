监控平台笔记

#### 重要：前端监控后，如何优化性能！！！

1-了解前端监控及项目架构设计

- 需求：实现前端异常与性能的监控，保证前端项目的稳定性建设，实现方案参考sentry
- 技术栈：基于monorep设计的全栈项目，前台react/原生js、后台nextjs、数据库
- Performance指标与 web Vital 基础：了解Performance指标、web Vital 指标，实现监控
- 性能与异常指标的分类与采集：性能指标（如加载时间、交互响应时间等），异常指标（如错误率、异常次数等）的分类，并完成数据采集

高级与收获

- 深入理解监控方案：深入理解并分析前端异常与性能监控的需求，优化现有的监控方案，提出有针对性的解决方案
- 高级项目架构的设计：具备设计复杂前端监控架构的能力，包括将监控功能集成到项目中，同时遵循性能和扩展性的最佳实践，插件化机制的运用
- Performance指标优化与高级分析：能够使用web vital 指标对性能问题进行深度分析
- 数据采集与上报流程化：熟悉性能和异常数据采集的高级方法，能够设计通用数据协议，封装上报数据



了解监控平台 sentry 

- https://sentry.io  账密 m13668219893@163.com 0123...guxinlei
  - 可视化平台 申请 appid
  - sdk平台 接入 appid
  - sdk平台 采集数据
  - 可视化平台 完成数据统计



- 创建原生项目 vite + ts (vanilla：不涉及到前端任何框架)

```js


cd vanilla
pnpm install
pnpm run dev
```

- 安装 @sentry/browser 8.34.0

- 初始化 sentry

```js
import {
  init,
  browserTracingIntegration,
  breadcrumbsIntegration,
  browserApiErrorsIntegration
} from "@sentry/browser"

init({
  dsn: "https://7f09a4b8c261c602e75612b340e8c5bc@o4509921884045312.ingest.us.sentry.io/4509922128887808",
  integrations: [
    browserTracingIntegration(),  // 监控性能 追踪用户交互的行为
    breadcrumbsIntegration(), // 记录用户的操作痕迹
    browserApiErrorsIntegration(), // 监控promise
  ], // 插件化设计
})
```





react中的项目配置,

```js
npm install @sentry/react
```

可能会用一些特定的集成插件

- captureConsoleIntegration : 用于捕获控制台日志
- brawserApiErrorsIntegration: 捕获浏览器API报错
- feedbackIntegration: 用于收集用户反馈
- httpClientegration: 跟踪http请求

实例代码

```js
import {
    init,
    browserTracingIntegration,
    captureConsoleIntegration,
    brawserApiErrorsIntegration,
    feedbackIntegration,
    httpClientegration,
} from "@sentry/react";

init({
    dsn:'',
    integrations:[
        browserTracingIntegration(),
        captureConsoleIntegration(),
        brawserApiErrorsIntegration(),
        feedbackIntegration(),
        httpClientegration()
    ],
    traceSampleRate:1.0,
});

setTimeout(()=>{
    myUndefinedFunction() // 模拟错误
},1000)

setTimeout(()=>{
    captureMessage("hello sentry") // 手动上报信息
},1000)
```

react 中的 ErrorBoundary

sentry 提供了 React的ErrorBoundary组件 ，用于捕获子组件中的错误，可以在App.tsx中包裹整个应用

```jsx
import {ErrorBoundary} from "@sentry/react";
import App from "./App"
function Root(){
    return (
    	<ErrorBoundary fallback={<p>发生错误了</p>}>
        	<App />
        </ErrorBoundary>
    )
}

export default Root
```



sentry 与 sourcemap 的原理及详细使用步骤

构建后的产物是经过压缩与丑化的，因此，打包后的产物，虽然能够监控到报错，但是无法清晰定位到报错的具体代码，此时就需要考虑通过sourcemap来定位具体代码。sourcemap是将编译后的代码映射回原始代码的一种文件，特别是通过i构建工具后。

sentry提供了一个与vite的插件，可以在构建时自动生成和上传sourcemap文件，快速定位问题。

sentry与vite的sourcemap集成

安装依赖包

- @sentry/browser：sentry sdk 用于捕获浏览器中的错误
- @sentry/react :  捕获react特定的错误
- @sentry/vite-plugin : vite插件用于自动化sourcemap的上传



配置vite插件 vite.config.js

- 确保在vite构件中配置启用了sourcemap，这样才能生成sourcemap文件

```js
build:{
	soucemap:true
}
```

- 使用 @sentry/vite-plugin 进行配置

```js
import { defineConfig } from "vite"
import { sentryVitePlugin } from "@sentry/vite-plugin"

export default defineConfig({
    build:{
        soucemap:true
    },
    plugins:[
        sentryVitePlugin({
            org:'your-org-slug', //你的 sentry组织
            project:'your-project-slug', // 你的 sentry 项目 slug
            authToken:process.env.SENTRY_AUTH_TOKEN, // sentry 验证身份的token
            include:'./dist', // 指定上传的文件夹
            urlPrefix:'~/dist', // sourcemap 的路径前缀
        })
    ]
})
```



配置sentry auth token

调用 sentry的api 需要用auth token的认证，有两种方式：

- 方式一：将 SENTRY_AUTH_TOKEN 作为环境变量添加到 .env.sentry-build-plugin 文件

```js
SENTRY_AUTH_TOKEN = your-auth-token
```

- 方式二：在CI/CD环境中将SENTRY_AUTH_TOKEN  设置为环境变量，确保它不会被泄露到代码仓库



运行项目构建

在本地或CI/CD环境中运行vite的生产构建

```node
pnpm run build
pnpm preview  预览打包后的线上产物
```

插件会在构建时自动生成sourcemap并上传到sentry。注意，插件在开发模式下不会上传sourcemap，只有在生产环境中才会触发上传



断网检测，通过ws通信、心跳机制，断网无法上报



优化与安全性

上传sourcemap后，建议删除本地生成的 .js.map 文件，以免源码泄露。可以在sentry插件中使用 sourcemaps.filesToDeleteAfterUpload 配置来上删除上传后的sourcemap文件

```js
plugins:[
    sentryVitePlugin({
        org:'your-org-slug', //你的 sentry组织
        project:'your-project-slug', // 你的 sentry 项目 slug
        authToken:process.env.SENTRY_AUTH_TOKEN, // sentry 验证身份的token
        include:'./dist', // 指定上传的文件夹
        urlPrefix:'~/dist', // sourcemap 的路径前缀
        sourcemaps:{
            filesToDeleteAfterUpload :['./dist/**/*.js.map'], // 上传后删除 sourcemap文件
        }
    })
]
```



总结

通过上述配置，可以：

- 使用vite生成和上传sourcemap到sentry
- sentry能够根据上传的sourcemap 将错误定位到原始代码，帮助快速调试
- 确保auth token 的安全性，并且可以根据需要删除本地的sourcemap文件



![image-20250829200622460](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20250829200622460.png)



**前端性能、异常与行为 监控设计 需求分析：**

1、前端性能监控

- 关键指标
  - CLS（Cumulative Layout Shift）：页面布局稳定性
  - LCP（Largest Contentful Paint）：最大内容绘制时间
  -  FID（First Input Delay）: 首次输入延迟
  - TTFB （Time to First Byte）: 首字节时间
  - INP（Interaction to Next Paint）: 交互到下一次绘制、交互延迟
  - FCP (First Contentful Paint)：首次内容绘制
- 监控工具
  - Web Vitals ： 采集核心 web 性能指标
  - PerformanceObserver : 监控性能事件
  - Performance API : 手动标记和测量性能

2、异常监控

- 异常捕获
  - 全局错误捕获：使用 window.onerror 捕获 jiavascript 错误
  - 未处理 Promise 捕获 ： 使用 window.onunhandledrejection 捕获未处理的Promise异常
- 错误报告
  - 错误级别：Info、Warning、Error 、Fatal
  - 错误上下文：URL、堆栈信息、用户操作痕迹
- 日志记录
  - 本地日志与远程日志系统对接

3、埋点监控

- 埋点类型
  - 手动埋点：在关键操作（如按钮点击、表单提交）中手动记录
  - 自动埋点：自动捕获页面访问、点击、滚动等用户操作
- 数据采集
  - DOM 事件监控：通过代理 addEventListener 捕获点击、键盘输入等操作
  - XHR/Fetch 请求监控：通过代理 XMLHttpRequest 和 fetch 捕获请求信息
  - 用户行为轨迹：捕获用户的页面跳转、滚动、点击轨迹
- 数据上报
  - 实时上报与批量上报
  - 上报频率控制与队列管理

4、监控平台集成

- 常用平台
  - Sentry ：前端性能与异常监控
  - Google Analytics ： 用户行为与转化率分析
  - LogRocket ： 结合日志和用户行为监控
  - Grafana +Loki ： 前端与后端的通用监控

5、最佳实践

- 性能优化建议
  - 图片优化、代码分割、懒加载等
- 异常处理
  - 错误捕获与回退机制
  - 异常用户友好提示
-  埋点设计
  - 埋点的合理性与精细化



整体流程实现：

- 指标分析
- SDK封装
- SDK DNS 服务
  - 后端 Nest.js
- 数据统计
- 数据监控（可视化）平台
  - 基于React 、Nest.js



多框架SDK支持：适配vanilla、React、Vue、Node，实现高效数据采集、支持插件化扩展

数据服务后端：Nest.js构建，能高效接受大量前端数据，预处理数据，将数据过滤、分类（kafka topics）和清晰，并支持按需存储（clickhouse），以便在可视化时减少冗余

数据可视化平台：基于React、Nest.js实现



项目架构设计 三个应用、 四个项目

- packages/* SDK 相关开发
- apps/backend/dns-server 数据处理与存储服务后端
- apps/backend/monitor 数据监控可视化与Saas 平台后端 
- apps/frontend/monitor 数据监控可视化与Saas 平台前端 



项目工程化设计

```shell
npm init -y
```

创建pnpm配置文件 pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'demos/*'
```

pnpm monorepo 管理

- 项目管理：采用pnpm monorepo 进行管理，可实现多模块统一依赖管理、快速安装以及高效的包缓存。monorepo 管理方式还方便了跨项目依赖共享和版本同步更新，是开发团队可以集中管理各个模块
- 文件结构： 项目的核心结构包括两个主要文件夹 packages 、apps、 demos
  - packages 存放SDK 相关模块，包含具体实现和工具函数等
  - apps： 存放数据采集服务等业务应用代码
  - demos：用于演示不同应用的SDK使用

子模块开发与发布

- 各模块均可单独开发、测试和发布，并可通过pnpm轻松实现包之间的应用。这可以保证每个模块在独立开发的同时依赖于其他模块的更新
- 各模块包的详细介绍：
  - browser：包含核心SDK的基础功能，负责与浏览器进行交互并采集性能，异常数据
  - browser-utils：为browser包提供工具函数库，包含数据处理、格式转换等常用工具
  - core： 项目的核心逻辑块，包含数据采集、处理和上报等核心功能
  - react：React适配包，提供与React应用无缝集成的功能，如性能监控组件、错误边界等
  - types：包含项目所有共享的TypeScript类型定义文件，便于维护和同意数据结构
  - utils：包含通用工具函数，可提供各模块调用，以提高代码复用性
  - vue：Vue适配包，提供与vue应用的集成功能，支持性能监控和异常捕获

工程化工具与配置

- 项目使用了pnpm来管理依赖，并利用monorepo来统一管理各个子模块
- 使用typescript作用项目的主要开发语言，提供静态类型支持和更好的开发体验
- ESLint和Prettier用于代码和石化和静态检查，确保代码风格统一，并减少潜在错误
- ts-node和ts-jest用于在开发环境下运行ts文件和进行单元测试

前端技术选型与设计-监控内容实现

- 使用 PerformanceObserver API 收集web性能指标i，如 FCP、LCP、CLS
- 使用window.onerror、window.onunhandledrejection 捕获全局 javascript 异常，并允许开发者自定义异常采集
- SDK 通过 HTTP协议上报数据到后端服务，并支持插件化设计，方便未来扩展更多监控项和上报逻辑

数据采集服务技术选型与设计

- 后端框架：使用Nest.js构建厚度按服务。Nest.js是一个基于TypeScript 的node框架，具有模块化、依赖注入等特性，便于构建可维护性和高扩展的应用
- 消息队列：使用Kafka实现消息队列，定义不同topics以及partition提升服务稳定行与性能
- 数据处理和存储：在应用中设计数据处理服务，机型数据信息、聚合等操作。集成Clickhouse列式数据库进行数据存储，方便后续的数据查询和分析
- 通信协议：数据采集服务等通过HTTP接口接受SDK上报的数据

监控可视化与SaaS平台技术选型

- 前端框架：选用React构建监控可视化与SaaS平台，结合shadcn/ui进行数据展示与界面设计
- 后端服务：数据可视化模块也使用Nest,js构建后端服务。



**工程化规范**

ESLint配置 （eslint.config.js）

- 依赖
  - @eslint/js、global.js：用于JavaScript的标准规则和全局变量支持
  - typescript-eslint：TS支持和类型检查，确保更强的类型支持
  - eslint-plugin-react-hooks：确保React Hooks 使用规范
  - eslint-plugin-react-refresh：支持React快速刷新功能
  - eslint-plugin-prettier：将Prettier集成到Eslint中，提供代码格式化
  - eslint-plugin-simple-sort：用于自动排序导入语句，提升可读性
- 配置规则
  - 前端（apps/frontend/monitor/**/*.{ts,tsx}）: 配置了React Hooks 和 React Refresh 的相关规则，以防止不正确的Kooh使用，同时禁用console输出
  - 后端（app/backend/**/*.ts）：启用Node和Jest的全局变量，并配置 TypesScript 规则，放宽对函数返回类型的要求，增强灵活性
  - 通用规则
    - 启用 prettier ，确保代码格式规则一致
    - 使用 simple-import-sort 自动排序 import 语句，便于代码管理
    - no-cosole 规则在前后端均启用，避免console.log的大量输出

- 安装依赖

```json
	"@eslint/js": "9.12.0",
    "@types/node": "22.7.5",
    "eslint": "9.12.0",
    "eslint-plugin-prettier": "5.2.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "0.4.12",
    "eslint-plugin-simple-import-sort": "12.1.1",
    "globals": "15.10.0",
    "typescript": "5.5.3",
    "typescript-eslint": "8.8.1"
```

- 配置文件 eslint.config.js

```js
const eslint = require('@eslint/js')
const globals = require('globals')
const tseslint = require('typescript-eslint')
const eslintPrettier = require('eslint-plugin-prettier')
const importSort = require('eslint-plugin-simple-import-sort')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')


// 需要过滤的文件、不被检测
const ignores = [
    'dist',
    'build',
    '**/*.js',
    '**/*.mjs',
    '**/*.d.ts',
    'eslint.config.js',
    'commitlint.config.js',
    'apps/frontend/monitor/src/components/ui/**/*',
    'packages/browser-utils/src/metrics/**/*',
]

const frontendMonitorConfig = {
    files: ['apps/frontend/monitor/**/*.{ts,tsx}'],
    ignores: ['apps/frontend/monitor/src/components/ui/**/*'],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser // 浏览器环境
    },
    plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'no-console': 'error'
    }
}

const backendMonitorConfig = {
    files: ['apps/backend/**/*.ts'],
    languageOptions: {
        globals: {
            ...globals.node, // global node环境
            ...globals.jest,
        },
        parser: tseslint.parser,
    },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'error',
    },
}


module.exports = tseslint.config(
    {
        ignores,
        // 继承自第三方的依赖
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
        // 插件
        plugins: {
            prettier: eslintPrettier,
            "simple-import-sort": importSort
        },
        rules: {
            "prettier/prettier": "error",
            "simple-import-sort/imports": "error",
        }

    },
    frontendMonitorConfig,
    backendMonitorConfig

)
```

- 代码指令 

```json
"lint:ts": "eslint"
```

```js
pnpm lint:ts
```



拼写检查（cspell.json）

- 依赖
  - cspell ： 用于拼写检查，避免项目中出现拼写错误，特别是影响代码的关键字
- 配置
  - 自定义词典：定义了 custom-words.txt , 用于收录特定的技术词汇和缩写
  - 忽略路径 ： 配置了拼写检查忽略路径，避免对项目依赖（如 node_moudles、dist）进行拼写检查，提高检查效率
- 依赖安装

```json
    "cspell": "8.14.4",
    "fast-glob": "^3.3.3",
```

- 配置文件 

cspell.json

```json
{
    // 拼写检查 
    // 语料库 基础通用化配置
    "import": ["@cspell/dict-lorem-ipsum/cspell-ext.json"],
    // 大小写是否敏感
    "caseSensitive": false,
    // 用户自定义字典
    "dictionaries": ["custom-words"],
    "dictionaryDefinitions": [
        {
            "name": "custom-words",
            "path": "./.cspell/custom-words.txt",
            "addWords": true
        }
    ],
    "ignorePaths": [
        "**/node_modules/**",
        "**/dist/**",
        "**/lib/**",
        "**/docs/**",
        "**/stats.html",
        "**/language/**",
        "**/language.ts",
        "**/package.json",
        "**/*.md",
        "eslint.config.js",
        "packages/browser-utils/src/metrics/**/*",
        ".gitignore"
    ]
}

```

.cspellcache

```json

```



Commit 信息规范（commitlint.config.js）

Commitlint 检查您的提交消息是否符合 Conventional commit format。

cz-git: 一款工程性更强，轻量级，高度自定义，标准输出格式的 commitizen 适配器。

- 依赖

  - @commitlint/cli 、@commitlint/config-conventional : 用于提交信息规范，保证提交历史清晰，便于项目维护
  - commitizen、cz-git : 提供交互是提交体验，使用emoji 增强可读性

  ```json
      "commitizen": "4.3.1",
      "fast-glob": "^3.3.3",
  ```

- 配置

  - 范围：自动提取 packages 和 apps 下的模块作为范围，确保提交信息更精准
  - 提交类型：配置了常用到的提交类型 （如 feat、fix、docs 等），并增加emoji标识，便于识别和管理
  - 提示定制：配置了互动式提示，要求填写范围、简单描述、详细描述等信息，确保提交信息完整

  ```json
    "config": {
      "commitizen": {
        "path": "node_modules/cz-git"
      }
    },
  ```

- 配置文件 commitlint.config.js

```js
const fg = require('fast-glob')

const getPackages = packagePath => fg.sync('*', { cwd: packagePath, onlyDirectories: true, deep: 2 })

const scopes = [
    ...getPackages('packages'),
    ...getPackages('apps'),
    ...getPackages('demos'),
    'docs',
    'project',
    'style',
    'ci',
    'dev',
    'deploy',
    'other',
]

// Emoji
/** @type {import('cz-git').UserConfig} */
// module.exports = {
//     extends: ['@commitlint/config-conventional'], // extends can be nested
//     parserPreset: 'conventional-changelog-conventionalcommits',
//     rules: {
//         'scope-enum': [2, 'always', scopes],
//     },
//     prompt: {
//         settings: {},
//         messages: {
//             skip: ':skip',
//             max: 'upper %d chars',
//             min: '%d chars at least',
//             emptyWarning: 'can not be empty',
//             upperLimitWarning: 'over limit',
//             lowerLimitWarning: 'below limit',
//         },
//         types: [
//             { value: 'feat', name: 'feat:     ✨  A new feature', emoji: '✨ ' },
//             { value: 'fix', name: 'fix:      🐛  A bug fix', emoji: '🐛 ' },
//             {
//                 value: 'docs',
//                 name: 'docs:     📝  Documentation only changes',
//                 emoji: '📝 ',
//             },
//             {
//                 value: 'style',
//                 name: 'style:    💄  Changes that do not affect the meaning of the code',
//                 emoji: '💄 ',
//             },
//             {
//                 value: 'refactor',
//                 name: 'refactor: 📦️   A code change that neither fixes a bug nor adds a feature',
//                 emoji: '📦️ ',
//             },
//             {
//                 value: 'perf',
//                 name: 'perf:     🚀  A code change that improves performance',
//                 emoji: '🚀 ',
//             },
//             {
//                 value: 'test',
//                 name: 'test:     🚨  Adding missing tests or correcting existing tests',
//                 emoji: '🚨 ',
//             },
//             {
//                 value: 'build',
//                 name: 'build:    🛠   Changes that affect the build system or external dependencies',
//                 emoji: '🛠 ',
//             },
//             {
//                 value: 'ci',
//                 name: 'ci:       🎡  Changes to our CI configuration files and scripts',
//                 emoji: '🎡 ',
//             },
//             {
//                 value: 'chore',
//                 name: "chore:    🔨  Other changes that don't modify src or test files",
//                 emoji: '🔨 ',
//             },
//             {
//                 value: 'revert',
//                 name: 'revert:   ⏪️  Reverts a previous commit',
//                 emoji: ':rewind:',
//             },
//         ],
//         useEmoji: true,
//         confirmColorize: true,
//         emojiAlign: 'center',
//         questions: {
//             scope: {
//                 description: 'What is the scope of this change (e.g. component or file name)',
//             },
//             subject: {
//                 description: 'Write a short, imperative tense description of the change',
//             },
//             body: {
//                 description: 'Provide a longer description of the change',
//             },
//             isBreaking: {
//                 description: 'Are there any breaking changes?',
//             },
//             breakingBody: {
//                 description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
//             },
//             breaking: {
//                 description: 'Describe the breaking changes',
//             },
//             isIssueAffected: {
//                 description: 'Does this change affect any open issues?',
//             },
//             issuesBody: {
//                 description: 'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
//             },
//             issues: {
//                 description: 'Add issue references (e.g. "fix #123", "re #123".)',
//             },
//         },
//     },
// }

// 汉化
// /** @type {import('cz-git').UserConfig} */
module.exports = {
    rules: {
        // @see: https://commitlint.js.org/#/reference-rules
    },
    prompt: {
        alias: { fd: 'docs: fix typos' },
        messages: {
            type: '选择你要提交的类型 :',
            scope: '选择一个提交范围（可选）:',
            customScope: '请输入自定义的提交范围 :',
            subject: '填写简短精炼的变更描述 :\n',
            body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
            breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
            footerPrefixesSelect: '选择关联issue前缀（可选）:',
            customFooterPrefix: '输入自定义issue前缀 :',
            footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
            generatingByAI: '正在通过 AI 生成你的提交简短描述...',
            generatedSelectByAI: '选择一个 AI 生成的简短描述:',
            confirmCommit: '是否提交或修改commit ?'
        },
        types: [
            { value: '特性', name: '特性:     新增功能' },
            { value: '修复', name: '修复:     修复缺陷' },
            { value: '文档', name: '文档:     文档变更' },
            { value: '格式', name: '格式:     代码格式（不影响功能，例如空格、分号等格式修正）' },
            { value: '重构', name: '重构:     代码重构（不包括 bug 修复、功能新增）' },
            { value: '性能', name: '性能:     性能优化' },
            { value: '测试', name: '测试:     添加疏漏测试或已有测试改动' },
            { value: '构建', name: '构建:     构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）' },
            { value: '集成', name: '集成:     修改 CI 配置、脚本' },
            { value: '回退', name: '回退:     回滚 commit' },
            { value: '其他', name: '其他:     对构建过程或辅助工具和库的更改（不影响源文件、测试用例）' }
        ],
        useEmoji: false,
        emojiAlign: 'center',
        useAI: false,
        aiNumber: 1,
        themeColorCode: '',
        scopes: [],
        allowCustomScopes: true,
        allowEmptyScopes: true,
        customScopesAlign: 'bottom',
        customScopesAlias: '以上都不是？我要自定义',
        emptyScopesAlias: '跳过',
        upperCaseSubject: false,
        markBreakingChangeMode: false,
        allowBreakingChanges: ['feat', 'fix'],
        breaklineNumber: 100,
        breaklineChar: '|',
        skipQuestions: [],
        issuePrefixes: [
            // 如果使用 gitee 作为开发管理
            { value: 'link', name: 'link:     链接 ISSUES 进行中' },
            { value: 'closed', name: 'closed:   标记 ISSUES 已完成' }
        ],
        customIssuePrefixAlign: 'top',
        emptyIssuePrefixAlias: '跳过',
        customIssuePrefixAlias: '自定义前缀',
        allowCustomIssuePrefix: true,
        allowEmptyIssuePrefix: true,
        confirmColorize: true,
        maxHeaderLength: Infinity,
        maxSubjectLength: Infinity,
        minSubjectLength: 0,
        scopeOverrides: undefined,
        defaultBody: '',
        defaultIssues: '',
        defaultScope: '',
        defaultSubject: ''
    }
}
```



Prettier (.prettierrc)

- 依赖
  - prettier ： 用于代码风格，保证代码风格一致，提升代码可读性
- 配置
  - 箭头函数参数：不强制使用括号
  - 行尾：统一使用LF，确保跨平台兼容性
  - 代码行长度：设置140字符，提升代码可读性
  - 分号：不使用封号，简化代码
  - 单引号：使用单引号，统一风格
- 配置文件 

​	.prettierrc

```json
{
    "arrowParens": "avoid",
    "endOfLine": "lf",
    "printWidth": 140,
    "semi": false,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "es5"
}
```

.prettierignore

```
/dist
*.yaml
```

Husky 配置 （.husky / pre-commit）

Husky 是 Git 钩子工具，可以设置在 git 各个阶段（pre-commit、commit-msg 等）触发。

注意格式 git commit -m "type: 空格+msg"

- 依赖：
  - husky ： 用于Git Hooks管理
  - lint-stage: 集成 Husky ，自动检测和格式化提交的代码文件，确保符合规范
- 配置
  - pre-commit 钩子：每次提交前自动运行 pnpm lint 和pnpm spellcheck, 确保通过 ESlint 检查和拼写检查

- 配置文件 .husky / pre-commit

```json
#!/usr/bin/env sh
pnpm lint:ts && pnpm spellcheck
```



使用web-vitals进行性能监控

通过循环遍历所有导入的性能监测函数，并为每个函数注册了处理函数 `sendToAnalytics`。

```js
import { onFCP, onINP, onLCP, onCLS, onTTFB} from 'web-vitals'

function sendToAnalytics(metric: any) {
  console.log(metric);
}

[onFCP, onINP, onLCP, onCLS, onTTFB].forEach((metric) => {
  metric(sendToAnalytics)
})
```

如果 web-vitals 不能满足需求，需要 performance api 自定义一些指标

```js
// 性能数据监控
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

```

异常数据监控、上报 error.ts

```js
// 常规栈错误
window.onerror = function (message, source, lineno, colno, error) {
    console.log("常规错误", message, source, lineno, colno, error);
    fetch("/error", {
        method: "POST",
        body: JSON.stringify({
            message,
            source,
            lineno,
            colno,
            error: error.stack,
        }),
    });
};

// promise 错误
window.onunhandledrejection = (event) => {
    console.log("promise 错误", event.reason.stack, event.reason.message);
    fetch("/error", {
        method: "POST",
        body: JSON.stringify({
            message: event.reason.message,
            source: event.reason.stack,
        }),
    })
};
```

自定义数据监控、上报

```js
import { captureMessage } from "./event.ts";
```

```js
export function captureMessage(message: string) {
  console.log(message);
  fetch("/message", {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });
}
```



配置GIT

```
git config --local user.name guxinlei
git config --local user.email 1339093682@qq.com
git config --local user.password gu133909
```

