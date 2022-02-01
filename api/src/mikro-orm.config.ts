import { User } from './entities/User'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import { Restaurant } from './entities/Restaurant'

export default {
  entities: [Post, Restaurant, User],
  dbName: 'poutineworld',
  user: 'postgres',
  password: 'postgres',
  type: 'postgresql',
  debug: !__prod__,
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[jt]s$/, // regex pattern for the migration files
  },
} as Parameters<typeof MikroORM.init>[0]
