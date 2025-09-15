2-指标采集、埋点设计实践与数据上报机制实现

核心模块设计

1、性能指标

- FP
- FCP
- CLS
- FID
- INP

2、异常指标

- js执行异常
- 资源加载异常
- promise reject 异常

3、交互事件

- 点击事件 click
- 进入、离开，pv、uv
- 只要能够监听的时间都可以上报

4、浏览器的宿主环境

- IP
- 机型
- 系统
- 浏览器版本

5、数据传输协议

- XHR
- 图片
- sendbacon
- fetch



使用之前的项目包，在demo内创建、初始化调试文件

```shell
pnpm create vite vanilla --template vanilla-ts
```

5-miaoma-monitor-demo\demos\vanilla\src\main.ts  最后类似sentry 封装成这样

```js
import { init } from '@miaoma/monitor-sdk-browser'

init({
  dsn: 'https://localhost:8000/appid-xxx'
})
```

进行反推，在packages/broswer内创建一个子包，名字为 @miaoma/monitor-sdk-browser

```js
npm init -y
```

```json
{
  "name": "@miaoma/monitor-sdk-browser",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```



SDK 核心架构设计

- @miaoma/monitor-sdk-core
  - 定义核心逻辑和Transport接口
  - 负责初始化与注册
- @miaoma/monitor-sdk-browser
  - 浏览器相关插件：性能、异常、点击事件采集
  - 自定义浏览器Transport实现
- @miaoma/monitor-sdk-browser-utils
  - 提供浏览器环境下的工具方法
- @miaoma/monitor-sdk-node
  - 适配node环境下的Transport上报实现



进行核心逻辑的编写之前，配置ts配置  tsconfig.json 、 tsconfig.client.json 、tsconfig.server.json

- 通用 tsconfig.json

```json
{
    "compilerOptions": {
        "alwaysStrict": false,
        "declaration": true, // 生成产出的dts产物
        "declarationMap": true, // 产物 map
        "downlevelIteration": true,
        "importHelpers": true,
        "inlineSources": true,
        "isolatedModules": true,
        "lib": ["ESNext"], // 外部依赖 还有 dom 等
        "moduleResolution": "node", // 模块化解析的规则
        "noErrorTruncation": true, // 校验型的配置
        "noFallthroughCasesInSwitch": true,
        "noImplicitReturns": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "preserveWatchOutput": true,
        "sourceMap": true, // 是否生成sourcemap
        "strict": true, // 是否严格模式
        "strictBindCallApply": false,
        "target": "es2018",
        "noUncheckedIndexedAccess": true
    }
}

```

- 服务端  tsconfig.server.json （nextjs官方推荐的配置）

```json
{
    "compilerOptions": {
        "module": "CommonJS", // 模块化规则
        "declaration": true, // 生成dts文件
        "removeComments": true, // 删除不必要的注释
        "emitDecoratorMetadata": true, // 生成装饰器的源数据
        "experimentalDecorators": true, // 指定装饰器 只有打开才能使用装饰器 @ 符号
        "allowSyntheticDefaultImports": true, // 是否允许默认导入
        "target": "ES2021", 
        "sourceMap": true,
        "incremental": true,
        "skipLibCheck": true, // 跳过检查 ？
        "strictNullChecks": false, // 得否严格空检查
        "noImplicitAny": false,
        "strictBindCallApply": false,
        "forceConsistentCasingInFileNames": false,
        "noFallthroughCasesInSwitch": false
    }
}

```

- 客户端 tsconfig.client.json

```json
{
    "extends": "./tsconfig.json", // 继承外部通用配置
    "compilerOptions": {
        "target": "ES2020", // 构建出的产物标准
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"], // 外部依赖 规范
        "module": "ESNext",
        "skipLibCheck": true,

        /* Bundler mode */
        "moduleResolution": "bundler", // 打包产物构建规范
        "allowImportingTsExtensions": true,
        "isolatedModules": true, // ...
        "moduleDetection": "force", // 是否一直检测模块化规范的内容
        "noEmit": true,
        "jsx": "react-jsx", // react 使用

        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
    }
}

```



packages / broswer 下的配置 tsconfig.json

```json
{
    "extends": "../../tsconfig.json",
    "include": ["src/**/*"], // 需要检测的文件路径
    "compilerOptions": {
        "types": ["node"], // 类型
        "lib": ["DOM", "ES6"] // 依赖
    }
}
```



整个构建的工作要通过 tsup 来完成，生成依赖构建

tsup ：介绍 ？？？

在最外层安装依赖，在broswer下 创建配置文件 tsup.config.ts

```ts
import { defineConfig } from 'tsup'

// 使用数组，可以保证输出产物可以适配多种不同的模块化规范,commonjs,esm,umd
export default defineConfig([
    {
        entry: ['src'],
        format: ['cjs'],
        outDir: 'dist/cjs',
    },
    {
        entry: ['src'],
        format: ['esm'],
        outDir: 'dist/esm',
    },
    {
        entry: ['src'],
        format: ['iife'],
        outDir: 'dist/umd',
        name:'miaoma-monitor-sdk-browser'
    }
])
```



实现SDK的细节性 需要关注点

1、产物如何构建

2、产物构建的内容如何被其他子包引用

- 非构建方式
- 构建方式-推荐-优点？



构建方式引用

packages.json

```json
{
  "name": "@miaoma/monitor-sdk-browser",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
      // 使用监听模式来启动 命令并行,但是window系统不支持 & 并行执行，使用concurrently插件
    //"build:watch": "pnpm run build:watch:transpile & pnpm run build:watch:types", 
    "build:watch": "concurrently \"pnpm run build:watch:transpile\" \"pnpm run build:watch:types\"",
    "build:watch:transpile": "tsup --watch",
    "build:watch:types": "tsc -p tsconfig.types.json --watch",
    "build": "pnpm run build:transpile && pnpm run build:types",
    "build:transpile": "tsup",
    "build:types": "tsc -p tsconfig.types.json"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}

```

tsconfig.types.json 输出类型配置 比tsconfig.json 生成的dts更规范

```json
{
    "extends": "./tsconfig.json",

    "compilerOptions": {
        "declaration": true,
        "declarationMap": true,
        "emitDeclarationOnly": true,
        "outDir": "build/types"
    }
}

```

执行 pnpm build:watch 生成dist产物，window系统不支持 & 并行执行，使用concurrently插件！！！

```shell
 pnpm build:watch
```

