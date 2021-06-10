/* eslint-disable import/no-extraneous-dependencies */
import { Provide } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import { Tags } from 'opentracing'

import { TracerConfig, TracerLog, TracerTag } from '../lib/types'
import { pathMatched } from '../util/common'

import { logError, processRequestQuery, updateSpan } from './helper'

@Provide()
export class TracerExtMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return tracerMiddleware
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
async function tracerMiddleware(
  ctx: IMidwayWebContext<unknown>,
  next: IMidwayWebNext,
): Promise<unknown> {

  const { tracerManager } = ctx
  const config = ctx.app.config.tracer as TracerConfig

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! tracerManager) {
    ctx.logger.warn('tracerManager invalid')
    return next()
  }
  // 白名单内的路由不会被追踪
  else if (pathMatched(ctx.path, config.whiteList)) {
    return next()
  }

  updateSpan(ctx)
  processRequestQuery(ctx)

  // preProcessFinish,
  tracerManager.spanLog({
    event: TracerLog.preProcessFinish,
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })


  if (config.enableCatchError) {
    try {
      await next()
      tracerManager.spanLog({
        event: TracerLog.postProcessBegin,
        time: genISO8601String(),
        [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
      })
    }
    catch (ex) {
      tracerManager.addTags({
        [Tags.ERROR]: true,
        [TracerTag.logLevel]: 'error',
      })

      await logError(tracerManager, ex as Error)
      throw ex
    }
  }
  else {
    await next()
    tracerManager.spanLog({
      event: TracerLog.postProcessBegin,
      time: genISO8601String(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })
  }
}


