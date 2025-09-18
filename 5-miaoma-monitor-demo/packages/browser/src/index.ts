
// 监控工作复杂多样，针对不同的指标要灵活接入
// 因此采用插件化设计 integration


// 初始化流程：外部调用 init 函数传入配置 → 创建监控管理器和传输层 → 初始化并准备数据上报
// 插件扩展：通过 integrations 数组传入不同插件（如错误监控插件、性能监控插件），实现按需接入功能
// 传输层扩展：通过实现新的 Transport 类（如 NodeTransport），可适配非浏览器环境的上报需求


// // 定义监控系统的初始化配置选项：
// interface InitOptions {
//     dsn:string,
//     integrations:any[],
// }

// // Monitoring 类 ,监控系统的核心管理器，负责统筹插件和上报逻辑：
// class Monitoring {
//     dsn:string
//     integrations:any[]
//     constructor(options:InitOptions){
//         this.dsn = options.dsn
//         this.integrations = options.integrations
//     }

//     // 接收一个 Transport 实例，触发初始化上报
//     // （这里是调用传输层的 send 方法）
//     init(transport:Transport){
//         transport.send({ })
//     }
// }

// type Transport = BrowserTransport 
// // NodeTransport | ImageTransport | FetchTransport

// // 浏览器环境的传输方式
// // 接收 dsn 作为上报地址
// // send 方法：定义了浏览器环境下的多种上报方式（注释中列举了 fetch、xhr、image、sendBeacon），当前仅实现了日志打印，实际使用时会根据场景选择合适的上报方式
// class BrowserTransport {
//     dsn:string
//     constructor(dsn:string){
//         this.dsn = dsn
//     }
//     send(data:any){
//         // 1、fetch
//         // fetch()
//         // 2、xhr
//         // new XMLHttpRequest()
//         // 3、image
//         // new Image(),img.src=xxx
//         // 4、sendBeacon
//         // navigator.sendBeacon(xxx)
//         console.log('浏览器上报',data)
//     }
// }

// export const init = (options: InitOptions) => {
//     // 1、monitor 实例初始化
//     const monitoring = new Monitoring({
//         dsn:options.dsn,
//         // 2、插件注册和消费
//         integrations:options.integrations,
//     })
//     // 3、定义上报逻辑的方法
//     const transport = new BrowserTransport(options.dsn)
//     // 4、触发初始上报
//     monitoring.init(transport)
//     // 5、具体初始化逻辑、上报协议定义和初始化 
//     // 错误采集
//     // new Errors(transport).init()
//     // 性能采集
//     // new Metrics(transport).init()

//     return monitoring
// }


import { Integration, Monitoring } from '@miaoma/monitor-sdk-core'
import { BrowserTransport } from './transport'
import { Errors } from './tracing/errorsIntegration'
import { Metrics } from '@miaoma/monitor-sdk-browser-utils'



export const init = (options: { dsn: string; integrations?: Integration[] }) => {
    // 1. monitor 实例初始化
    const monitoring = new Monitoring({
        dsn: options.dsn,
        // 2. 插件注册和消费
        integrations: options?.integrations,
    })
    // 定义一个上报逻辑方法
    const transport = new BrowserTransport(options.dsn)
    monitoring.init(transport)
    // 3. 上报协议定义与初始化
    // // 错误采集
    new Errors(transport).init()
    // // 性能采集
    new Metrics(transport).init()

    return monitoring
}
