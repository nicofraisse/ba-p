import { UserResolver } from './resolvers/user'
import { RestaurantResolver } from './resolvers/restaurant'
import { PostResolver } from './resolvers/post'
import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import mikroConfig from './mikro-orm.config'
import 'reflect-metadata'
import cors from 'cors'
import { createClient } from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { __prod__ } from './constants'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)

  // Run all new migrations whenever server restarts
  await orm.getMigrator().up()

  const app = express()
  let RedisStore = connectRedis(session)
  let redisClient = createClient()

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // can't access cookie from frontend js code
        secure: __prod__,
        sameSite: 'lax', // csrf
      },
      saveUninitialized: false,
      secret: 'qls3sdu93m4cyt09wqy0lq4us0ql9rs08qy34097qxy8ae',
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, RestaurantResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(4000, () => {
    console.log('Server started on localhost:4000')
  })
}

main().catch((e) => console.log(e))
