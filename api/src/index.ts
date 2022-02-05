import { Upvote } from './entities/Upvote'
import { ReviewResolver } from './resolvers/review'
import { Review } from './entities/Review'
import { Post } from './entities/Post'
import { User } from './entities/User'
import { UserResolver } from './resolvers/user'
import { RestaurantResolver } from './resolvers/restaurant'
import { PostResolver } from './resolvers/post'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import cors from 'cors'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { __prod__ } from './constants'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { createConnection } from 'typeorm'
import { Restaurant } from './entities/Restaurant'
import 'dotenv-safe/config'

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',

    url: process.env.DATABASE_URL,
    logging: true,
    // synchronize: true,
    entities: [Post, User, Review, Restaurant, Upvote],
  })

  // Run all new migrations whenever server restarts
  await conn.runMigrations()

  const app = express()
  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)
  app.set('proxy', 1)

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  )
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // can't access cookie from frontend js code
        secure: __prod__,
        sameSite: 'lax', // csrf
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        PostResolver,
        RestaurantResolver,
        UserResolver,
        ReviewResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(parseInt(process.env.PORT), () => {
    console.log(`Server started on localhost:${process.env.PORT}`)
  })
}

main().catch((e) => console.log(e))
