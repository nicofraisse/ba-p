import { ServerContext } from './../types'
import { Post } from '../entities/Post'
import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql'

@Resolver()
export class PostResolver {
  // All posts
  @Query(() => [Post])
  posts(@Ctx() { em }: ServerContext): Promise<Post[]> {
    return em.find(Post, {})
  }

  // One post
  @Query(() => Post, { nullable: true })
  post(
    @Ctx() { em }: ServerContext,
    @Arg('id', () => Int) _id: number
  ): Promise<Post | null> {
    return em.findOne(Post, { _id })
  }

  // Create post
  @Mutation(() => Post)
  async createPost(
    @Ctx() { em }: ServerContext,
    @Arg('title') title: string
  ): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  // Update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: ServerContext,
    @Arg('id') _id: number,
    @Arg('title', () => String) title: string
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { _id })
    if (!post) {
      return null
    }
    if (typeof title !== 'undefined') {
      post.title = title
      await em.persistAndFlush(post)
    }
    return post
  }

  // Delete post
  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() { em }: ServerContext,
    @Arg('id', () => Int) _id: number
  ): Promise<Boolean> {
    await em.nativeDelete(Post, { _id })
    return true
  }
}
