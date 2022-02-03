import { Post } from '../entities/Post'
import { Resolver, Query, Arg, Int, Mutation } from 'type-graphql'

@Resolver()
export class PostResolver {
  // All posts
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find()
  }

  // One post
  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  // Create post
  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    return Post.create({ title }).save()
  }

  // Update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ id })
    if (!post) {
      return null
    }
    if (typeof title !== 'undefined') {
      Post.update({ id }, { title })
    }
    return post
  }

  // Delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => Int) id: number): Promise<Boolean> {
    await Post.delete(id)
    return true
  }
}
