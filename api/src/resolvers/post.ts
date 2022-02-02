import { ServerContext } from './../types'
import { Post } from '../entities/Post'
import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql'

@Resolver()
export class PostResolver {
  // All posts
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find()
  }

  // One post
  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) _id: number): Promise<Post | undefined> {
    return Post.findOne(_id)
  }

  // Create post
  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    return Post.create({ title }).save()
  }

  // Update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') _id: number,
    @Arg('title', () => String) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ _id })
    if (!post) {
      return null
    }
    if (typeof title !== 'undefined') {
      Post.update({ _id }, { title })
    }
    return post
  }

  // Delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => Int) _id: number): Promise<Boolean> {
    await Post.delete(_id)
    return true
  }
}
