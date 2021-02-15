import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import {Field, ObjectType, Int} from "type-graphql"

@ObjectType()
@Entity()
export class User extends BaseEntity{

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    email: string;

    @Column()
    password: string;
}
