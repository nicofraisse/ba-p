import { Review } from './Review'
import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  // Many to many User <-> Upvote
  // User -> this is a join table <- Posts
  // User -> Upvote <- Posts
  @Field()
  @Column({ type: 'int' })
  value: number

  @Field()
  @PrimaryColumn()
  userId: number

  @Field(() => User)
  @ManyToOne(() => User, (user: User) => user.upvotes)
  user: User

  @Field()
  @PrimaryColumn()
  reviewId: number

  @Field(() => Review)
  @ManyToOne(() => Review, (review: Review) => review.upvotes)
  review: Review

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
