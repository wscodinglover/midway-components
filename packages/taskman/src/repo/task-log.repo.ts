import assert from 'node:assert'

import {
  App,
  Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { Logger } from '@mw-components/jaeger'
import { DbManager, Kmore } from '@mw-components/kmore'

import {
  DbModel,
  DbReplica,
  InitTaskLogDTO,
  TaskServerConfig,
  ServerMethod,
  TaskLogDTO,
  ConfigKey,
} from '../lib/index'

import { Application, Context } from '~/interface'


@Provide()
export class TaskLogRepository {

  @App() protected readonly app: Application

  @Inject() protected readonly logger: Logger

  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  @Inject() dbManager: DbManager<DbReplica, DbModel, Context>

  db: Kmore<DbModel, Context>
  ref_tb_task_log: Kmore<DbModel, Context>['camelTables']['ref_tb_task_log']

  @Init()
  async init(): Promise<void> {
    const db = this.dbManager.getDataSource(DbReplica.taskMaster)
    assert(db)
    this.db = db
    this.ref_tb_task_log = db.camelTables.ref_tb_task_log
  }

  // async [ServerMethod.destroy](): Promise<void> {
  //   await this.db.dbh.destroy()
  // }

  async [ServerMethod.create](input: InitTaskLogDTO): Promise<TaskLogDTO> {
    const ret = await this.ref_tb_task_log()
      .insert(input)
      .returning('*')
      .then((arr) => {
        const [row] = arr
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret
  }


  async [ServerMethod.read](id: TaskLogDTO['taskLogId']): Promise<TaskLogDTO | undefined> {
    const ret = await this.ref_tb_task_log()
      .where('task_log_id', id)
      .limit(1)
      .then(arr => arr[0])

    return ret
  }

}

