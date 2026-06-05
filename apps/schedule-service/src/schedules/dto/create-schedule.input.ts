import { InputType, Field, ID } from "@nestjs/graphql";

@InputType()
export class CreateScheduleInput {
  @Field(() => ID)
  customerId: string;

  @Field(() => ID)
  doctorId: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;
}
