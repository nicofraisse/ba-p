import { Connection, IDatabaseDriver, EntityManager } from '@mikro-orm/core'
import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'

export type ServerContext = {
  em: EntityManager<IDatabaseDriver<Connection>>
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number }
  }
  res: Response
}
