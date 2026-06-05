import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Customer } from "../../customers/dto/customer.type";
import { Doctor } from "../../doctors/dto/doctor.type";

@ObjectType()
export class Schedule {
  @Field(() => ID)
  id: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => Customer)
  customer: Customer;

  @Field(() => Doctor)
  doctor: Doctor;

  @Field()
  createdAt: Date;
}
