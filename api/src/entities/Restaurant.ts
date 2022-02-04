import { Review } from './Review'
import {
  Column,
  CreateDateColumn,
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class Restaurant extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => Review)
  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date

  @Field()
  reviewCount: number

  @Field()
  averageRating: number

  @Field()
  aleadyRated: boolean

  @Field()
  @Column({ unique: true })
  name!: string
}
