import { ServerContext } from './../types'
import { MiddlewareFn } from 'type-graphql'

export const isAuth: MiddlewareFn<ServerContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Vous n'êtes pas connecté(e)")
  }
  return next()
}
