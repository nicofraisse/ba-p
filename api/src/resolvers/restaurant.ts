import { ServerContext } from './../types'
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Float,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { Restaurant } from '../entities/Restaurant'
import { Review } from '../entities/Review'
import { isAuth } from './../middleware/isAuth'

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

  // Review count
  @FieldResolver(() => Int, { nullable: true })
  async reviewCount(@Root() restaurant: Restaurant) {
    const restaurantReviews = await Review.find({
      where: { restaurantId: restaurant.id },
    })
    if (!restaurantReviews) {
      return 0
    }
    return restaurantReviews.length
  }

  // Average rating
  @FieldResolver(() => Float, { nullable: true })
  async averageRating(@Root() restaurant: Restaurant) {
    let { avg } = await getConnection()
      .getRepository(Review)
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .where('"restaurantId" = :id', { id: `${restaurant.id}` })

      .getRawOne()
    return avg || 0
  }

  // Current user has already rated the restaurant
  @FieldResolver(() => Boolean)
  async alreadyRated(
    @Ctx() { req }: ServerContext,
    @Root() restaurant: Restaurant
  ) {
    console.log('there is', req.session)
    if (!req.session.userId) {
      return false
    }
    const review = await Review.findOne({
      where: {
        userId: req.session.userId,
        restaurantId: restaurant.id,
      },
    })

    console.log('yoo', review)

    return !!review
  }
}
