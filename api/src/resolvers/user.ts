import { FORGET_PASSWORD_PREFIX } from './../constants'
import { sendEmail } from './../lib/sendEmail'
import { validateRegister } from './../lib/validateRegister'
import { User } from './../entities/User'
import { ServerContext } from './../types'
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  Query,
  Field,
  ObjectType,
} from 'type-graphql'
import argon2 from 'argon2'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { v4 } from 'uuid'
import { getConnection } from 'typeorm'

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
  me(@Ctx() { req }: ServerContext) {
    if (!req.session.userId) {
      return null
    }
    return User.findOne(req.session.userId)
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: ServerContext
  ): Promise<UserResponse> {
    console.log('we doing stuff')
    const errors = validateRegister(options)
    if (errors) return { errors }

    const hashedPassword = await argon2.hash(options.password)

    let user

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning('*')
        .execute()
      console.log('sdjklfhasdh', result.raw[0])
      user = result.raw[0]
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
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: ServerContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    )
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "cet utilisateur ou email n'existe pas",
          },
        ],
      }
    }
    const validPassword = await argon2.verify(user.password, password)

    if (!validPassword) {
      return {
        errors: [{ field: 'password', message: 'mot de passe incorrect' }],
      }
    }

    req.session!.userId = user._id
    return { user }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: ServerContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: Error) => {
        res.clearCookie('qid')
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        resolve(true)
      })
    )
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: ServerContext
  ) {
    const user = await User.findOne({ where: { email } })
    // email not in db
    if (!user) return true

    const token = v4()

    // store user's token in redis for 7 days
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user._id,
      'ex',
      1000 * 60 * 60 * 24 * 7
    )

    const html = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`

    // Send email to the user with a link containing that token
    await sendEmail(email, html)

    return true
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: ServerContext
  ): Promise<UserResponse> {
    if (newPassword.length < 6) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'le mot de passe doit contenir au moins six cararctères',
          },
        ],
      }
    }
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token)
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: "ce token n'est plus valide",
          },
        ],
      }
    }
    const user = await User.findOne({ _id: parseInt(userId) })
    if (!user) {
      return {
        errors: [
          {
            field: 'user',
            message: "cet utilisatuer n'existe pas",
          },
        ],
      }
    }

    User.update(
      { _id: parseInt(userId) },
      { password: await argon2.hash(newPassword) }
    )
    const key = FORGET_PASSWORD_PREFIX + token
    await redis.del(key)
    // log them in
    req.session.userId = user._id
    return { user }
  }
}
