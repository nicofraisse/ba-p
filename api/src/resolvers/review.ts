import { getConnection } from 'typeorm'
import { isAuth } from './../middleware/isAuth'
import { ServerContext } from './../types'
import { Review } from '../entities/Review'
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Int,
  Mutation,
  Field,
  InputType,
  UseMiddleware,
} from 'type-graphql'
import { Upvote } from '../entities/Upvote'

@InputType()
class ReviewInput {
  @Field()
  comment: string
  @Field()
  rating!: number
  @Field()
  restaurantId!: number
}

@Resolver()
export class ReviewResolver {
  // All reviews
  @Query(() => [Review])
  async reviews(
    @Arg('restaurantId', () => Int, { nullable: true })
    restaurantId?: number | null
  ): Promise<Review[]> {
    const reviews = await Review.find(
      restaurantId ? { where: { restaurantId } } : {}
    )
    return reviews
  }

  // One review
  @Query(() => Review, { nullable: true })
  review(@Arg('id', () => Int) id: number): Promise<Review | undefined> {
    return Review.findOne(id)
  }

  // Create review
  @Mutation(() => Review)
  @UseMiddleware(isAuth)
  async createReview(
    @Arg('input') input: ReviewInput,
    @Ctx() { req }: ServerContext
  ): Promise<Review> {
    const review = await Review.create({
      ...input,
      userId: req.session.userId,
    }).save()
    return review
  }

  // Update review
  @Mutation(() => Review, { nullable: true })
  async updateReview(
    @Arg('id') id: number,
    @Arg('comment', () => String) comment: string
  ): Promise<Review | null> {
    const review = await Review.findOne(id)
    if (!review) {
      return null
    }
    if (typeof comment !== 'undefined') {
      Review.update({ id }, { comment })
    }
    return review
  }

  // Delete review
  @Mutation(() => Boolean)
  async deleteReview(@Arg('id', () => Int) id: number): Promise<Boolean> {
    await Review.delete(id)
    return true
  }

  // Upvote review
  @Mutation(() => Boolean)
  async vote(
    @Arg('reviewId', () => Int) reviewId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: ServerContext
  ) {
    const isUpvote = value !== -1
    const realValue = isUpvote ? 1 : -1
    const { userId } = req.session

    await getConnection().query(
      `
    START TRANSACTION;

    insert into upvote ("userId", "reviewId", value)
    values(${userId}, ${reviewId}, ${realValue})'

    update review
    set points = points + ${realValue}
    where id = ${reviewId}

    COMMIT;`
    )

    return true
  }
}
