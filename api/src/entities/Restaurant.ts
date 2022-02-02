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
  _id!: number

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date

  @Field()
  @Column({ unique: true })
  name!: string
}
