import { Transport } from './transport'

/**
 * 插件协议
 */
export interface IIntegration {
    init(transport: Transport): void
}

export class Integration implements IIntegration {
    transport: Transport | null = null

    init(transport: Transport): void {
        this.transport = transport
    }
}

/**
 * monitoring 参数项
 */
export interface MonitoringOptions {
    dsn: string
    integrations?: Integration[]
}
