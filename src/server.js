import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { API_V1 } from '~/routes/v1'
import { StatusCodes } from 'http-status-codes'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  app.use(express.json())

  app.use('/api/v1', API_V1)

  app.use(errorHandlingMiddleware)

  app.listen( env.PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`I am running at ${ env.APP_HOST }:${ env.PORT }/`)
  })

  exitHook(() => {
    CLOSE_DB()
  })
}

(async () => {
  try {
    await CONNECT_DB()
    START_SERVER()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  }
})()