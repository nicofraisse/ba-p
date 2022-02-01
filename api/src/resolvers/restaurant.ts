import { ServerContext } from './../types'
import { Restaurant } from '../entities/Restaurant'
import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql'

@Resolver()
export class RestaurantResolver {
  // All restaurants
  @Query(() => [Restaurant])
  restaurants(@Ctx() { em }: ServerContext): Promise<Restaurant[]> {
    return em.find(Restaurant, {})
  }

  // One restaurant
  @Query(() => Restaurant, { nullable: true })
  restaurant(
    @Ctx() { em }: ServerContext,
    @Arg('id', () => Int) _id: number
  ): Promise<Restaurant | null> {
    return em.findOne(Restaurant, { _id })
  }

  // Create a restaurant
  @Mutation(() => Restaurant)
  async createRestaurant(
    @Ctx() { em }: ServerContext,
    @Arg('name') name: string
  ): Promise<Restaurant> {
    const restaurant = em.create(Restaurant, { name })
    await em.persistAndFlush(restaurant)
    return restaurant
  }
}
