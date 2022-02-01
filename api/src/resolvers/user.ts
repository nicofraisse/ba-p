import { User } from './../entities/User'
import { ServerContext } from './../types'
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  Query,
  InputType,
  Field,
  ObjectType,
} from 'type-graphql'
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: ServerContext) {
    if (!req.session.userId) {
      return null
    }
    const user = await em.findOne(User, { _id: req.session.userId })
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: ServerContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message:
              "le nom d'utilisatuer doit contenir au moins deux cararctères",
          },
        ],
      }
    }
    if (options.password.length < 6) {
      return {
        errors: [
          {
            field: 'password',
            message: 'le mot de passe doit contenir au moins six cararctères',
          },
        ],
      }
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    })
    try {
      await em.persistAndFlush(user)
    } catch (e) {
      if (e.code === '23505')
        return {
          errors: [
            {
              field: 'username',
              message: "ce nom d'utilisateur est déjà pris",
            },
          ],
        }
    }
    req.session.userId = user._id
    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: ServerContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username,
    })
    if (!user) {
      return {
        errors: [
          { field: 'username', message: "cet utilisateur n'existe pas" },
        ],
      }
    }
    const validPassword = await argon2.verify(user.password, options.password)

    if (!validPassword) {
      return {
        errors: [{ field: 'password', message: 'mot de passe incorrect' }],
      }
    }

    req.session!.userId = user._id
    await em.persistAndFlush(user)
    return { user }
  }
}
