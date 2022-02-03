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

const main = async () => {
  await createConnection({
    type: 'postgres',
    database: 'poutineworld4',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [Post, User, Review, Restaurant, Upvote],
  })

  // Run all new migrations whenever server restarts

  const app = express()
  const RedisStore = connectRedis(session)
  const redis = new Redis()

  app.use(
    cors({
      origin: 'http://localhost:3000',
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
      secret: 'qls3sdu93m4cyt09wqy0lq4us0ql9rs08qy34097qxy8ae',
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

  app.listen(4000, () => {
    console.log('Server started on localhost:4000')
  })
}

main().catch((e) => console.log(e))
