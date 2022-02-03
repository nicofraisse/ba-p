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
  ObjectType,
  Field,
} from 'type-graphql'

@ObjectType()
class PaginatedRestaurants {
  @Field(() => [Restaurant])
  restaurants: Restaurant[]
  @Field()
  hasMore: boolean
}

@Resolver(Restaurant)
export class RestaurantResolver {
  // Paginated restaurants
  @Query(() => PaginatedRestaurants)
  async restaurants(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedRestaurants> {
    const realLimit = Math.min(limit, 50)
    const realLimitPlusOne = realLimit + 1
    const query = getConnection()
      .getRepository(Restaurant)
      .createQueryBuilder('r')
      .orderBy('"createdAt"', 'DESC')
      .take(realLimitPlusOne)

    if (cursor) {
      query.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      })
    }

    const restaurants = await query.getMany()

    return {
      hasMore: restaurants.length === realLimitPlusOne,
      restaurants: restaurants.slice(0, realLimit),
    }
  }

  // One restaurant
  @Query(() => Restaurant, { nullable: true })
  restaurant(
    @Arg('id', () => Int) id: number
  ): Promise<Restaurant | undefined> {
    return Restaurant.findOne({ id })
  }

  // Create a restaurant
  @Mutation(() => Restaurant)
  @UseMiddleware(isAuth)
  async createRestaurant(@Arg('name') name: string): Promise<Restaurant> {
    const restaurant = Restaurant.create({ name }).save()
    return restaurant
  }
}
