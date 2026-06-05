import { InputType, Field, ID } from "@nestjs/graphql";

@InputType()
export class CreateScheduleInput {
  @Field()
  objective: string;

  @Field(() => ID)
  customerId: string;

  @Field(() => ID)
  doctorId: string;

  @Field()
  scheduledAt: Date;
}
