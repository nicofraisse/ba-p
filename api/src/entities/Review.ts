import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Restaurant } from './Restaurant'
import { User } from './User'

@ObjectType()
@Entity()
export class Review extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date

  @Field()
  @Column()
  userId: number

  @Field()
  @Column()
  restaurantId!: number

  @ManyToOne(() => User, (user: User) => user.reviews)
  user: User

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
