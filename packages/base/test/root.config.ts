import { IncomingHttpHeaders } from 'node:http'

import { Application, IMidwayContainer, JsonResp } from '@mw-components/share'
import supertest, { SuperTest } from 'supertest'


const CI = !! process.env.CI
export type TestResponse = supertest.Response
export type TestRespBody = JsonResp<RespData>
export interface RespData {
  header: IncomingHttpHeaders
  url: string
  cookies: unknown
}

export interface TestConfig {
  CI: boolean
  app: Application
  container: IMidwayContainer
  host: string
  httpRequest: SuperTest<supertest.Test>
}
export const testConfig = {
  CI,
  host: '',
} as TestConfig
