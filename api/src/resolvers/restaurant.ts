import { getConnection } from 'typeorm'
import { isAuth } from './../middleware/isAuth'
import { Restaurant } from '../entities/Restaurant'
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  UseMiddleware,
} from 'type-graphql'

@Resolver()
export class RestaurantResolver {
  // All restaurants
  @Query(() => [Restaurant])
  restaurants(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<Restaurant[]> {
    const realLimit = Math.min(limit, 50)
    const query = getConnection()
      .getRepository(Restaurant)
      .createQueryBuilder('r')
      .take(realLimit)
      .orderBy('"createdAt"', 'DESC')

    if (cursor) {
      query.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      })
    }

    return query.getMany()
  }

  // One restaurant
  @Query(() => Restaurant, { nullable: true })
  restaurant(
    @Arg('id', () => Int) _id: number
  ): Promise<Restaurant | undefined> {
    return Restaurant.findOne({ _id })
  }

  // Create a restaurant
  @Mutation(() => Restaurant)
  @UseMiddleware(isAuth)
  async createRestaurant(@Arg('name') name: string): Promise<Restaurant> {
    const restaurant = Restaurant.create({ name }).save()
    return restaurant
  }
}
