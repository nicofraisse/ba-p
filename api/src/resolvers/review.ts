import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { Review } from '../entities/Review'
import { Upvote } from '../entities/Upvote'
import { isAuth } from './../middleware/isAuth'
import { ServerContext } from './../types'

@InputType()
class ReviewInput {
  @Field()
  comment: string
  @Field()
  rating!: number
  @Field()
  restaurantId!: number
}

@ObjectType()
class UpvoteResponse {
  @Field()
  points: number
  @Field(() => Int, { nullable: true })
  voteStatus: number
}

@Resolver(Review)
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
  @UseMiddleware(isAuth)
  async updateReview(
    @Arg('id', () => Int) id: number,
    @Arg('comment', () => String) comment: string,
    @Arg('rating', () => Int) rating: number,
    @Ctx() { req }: ServerContext
  ): Promise<Review | null> {
    const review = await Review.findOne(id)
    if (!review) {
      return null
    }

    if (review.userId !== req.session.userId) {
      throw new Error('Vous ne pouvez modifier que vos propres avis')
    }

    if (typeof comment !== 'undefined') {
      Review.update({ id }, { comment, rating })
    }

    return review
  }

  // Delete review
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteReview(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: ServerContext
  ): Promise<Boolean> {
    await Review.delete({ id, userId: req.session.userId })
    return true
  }

  // Upvote review
  @Mutation(() => UpvoteResponse)
  async vote(
    @Arg('reviewId', () => Int) reviewId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: ServerContext
  ) {
    const isUpvote = value !== -1
    const realValue = isUpvote ? 1 : -1
    const { userId } = req.session

    const upvote = await Upvote.findOne({ where: { reviewId, userId } })
    // Already voted before, and changing the vote
    const review = (await Review.findOne({ id: reviewId })) as any
    if (upvote && upvote.value !== realValue) {
      getConnection().transaction(async (tm) => {
        await tm.query(
          ` update upvote
        set value = $1
        where "userId" = $2 and "reviewId"  = $3;
`,
          [realValue, userId, reviewId]
        )

        await tm.query(
          ` update review
        set points = points + $1
        where id = $2;
`,
          [2 * realValue, reviewId]
        )
      })
      return {
        points: review.points + 2 * realValue,
        voteStatus: realValue,
      }
      // Have not voted before
    } else if (!upvote) {
      getConnection().transaction(async (tm) => {
        await tm.query(
          `insert into upvote ("userId", "reviewId", value)
        values($1, $2, $3)
`,
          [userId, reviewId, realValue]
        )
        await tm.query(
          ` update review
        set points = points + $1
        where id = $2;
`,
          [realValue, reviewId]
        )
      })
      return {
        points: review.points + realValue,
        voteStatus: realValue,
      }
    }

    return { points: review.points, voteStatus: review.voteStatus }
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() review: Review, @Ctx() { req }: ServerContext) {
    if (!req.session.userId) {
      return null
    }

    const upvote = await Upvote.findOne({
      where: { userId: req.session.userId, reviewId: review.id },
    })

    return upvote ? upvote.value : null
  }
}
