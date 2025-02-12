import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core'
import { retrieveFirstIp } from '@waiting/shared-core'

import { ErrorCode, NpmPkg } from '../lib/index'


export default (appInfo: MidwayAppInfo): MidwayConfig => {

  const config = {} as MidwayConfig

  config.koa = {
    port: 7001,
  }

  config.welcomeMsg = 'Hello Midwayjs!'

  config.globalErrorCode = ErrorCode

  // use for cookie sign key, should change to your own and keep security
  config.keys = '1559532739677_8888'

  // '2020-01-01T00:00:00Z'
  const epoch = 1577836800000
  config.koidConfig = {
    node: 0,
    epoch,
  }

  const ip = retrieveFirstIp()
  const nameNorm = (appInfo.pkg as NpmPkg).name.replace(/@/ug, '').replace(/\//ug, '-')
  config.prometheus = {
    labels: {
      APP_NAME: (appInfo.pkg as NpmPkg).name,
      APP_NAME_NORM: nameNorm,
      APP_VER: (appInfo.pkg as NpmPkg).version,
      APP_PID: process.pid,
      APP_PPID: process.ppid,
      APP_IPs: ip ? ip.address : 'n/a',
    },
  }


  return config
}
