import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Review } from './Review'
import { Upvote } from './Upvote'
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => Review)
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[]

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[]

  @Field()
  @UpdateDateColumn()
  updatedAt: Date

  @Field()
  @Column({ unique: true })
  username!: string

  @Field()
  @Column({ unique: true })
  email!: string

  @Column()
  password!: string
}
