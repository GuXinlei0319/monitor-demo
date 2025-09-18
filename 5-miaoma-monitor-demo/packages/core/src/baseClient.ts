/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */

import { Transport } from './transport'
import { MonitoringOptions } from './types'

export let getTransport: () => Transport | null = () => null

export class Monitoring {
    private transport: Transport | null = null

    constructor(private options: MonitoringOptions) {}

    init(transport: Transport) {
        this.transport = transport
        getTransport = () => transport
        // 插件的消费
        for (const integration of this.options.integrations ?? []) {
            integration.init(transport)
        }
    }

    // reportMessage(message: string) {
    //     this.transport?.send({ type: 'message', message })
    // }

    // reportEvent(event: unknown) {
    //     this.transport?.send({ type: 'event', event })
    // }
}
