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
  async reviews(): Promise<Review[]> {
    return Review.find()
  }

  // One review
  @Query(() => Review, { nullable: true })
  review(@Arg('id', () => Int) _id: number): Promise<Review | undefined> {
    return Review.findOne(_id)
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
    @Arg('id') _id: number,
    @Arg('comment', () => String) comment: string
  ): Promise<Review | null> {
    const review = await Review.findOne({ _id })
    if (!review) {
      return null
    }
    if (typeof comment !== 'undefined') {
      Review.update({ _id }, { comment })
    }
    return review
  }

  // Delete review
  @Mutation(() => Boolean)
  async deleteReview(@Arg('id', () => Int) _id: number): Promise<Boolean> {
    await Review.delete(_id)
    return true
  }
}
