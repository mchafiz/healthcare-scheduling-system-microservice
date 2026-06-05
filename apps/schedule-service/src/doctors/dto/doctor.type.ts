import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class Doctor {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  specialization: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
