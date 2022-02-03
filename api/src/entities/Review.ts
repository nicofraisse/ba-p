import { Field, Int, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Restaurant } from './Restaurant'
import { Upvote } from './Upvote'
import { User } from './User'

@ObjectType()
@Entity()
export class Review extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date

  @Field(() => Int)
  @Column()
  restaurantId!: number

  @Field()
  @Column()
  userId: number

  @Field()
  @ManyToOne(() => User, (user) => user.reviews, { eager: true })
  user: User

  @OneToMany(() => Upvote, (upvote) => upvote.review)
  upvotes: Upvote[]

  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.reviews)
  restaurant: Restaurant

  @Field()
  @Column({ array: true, nullable: true })
  photos: string

  @Field()
  @Column()
  comment: string

  @Field()
  @Column()
  rating!: number

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number
}
