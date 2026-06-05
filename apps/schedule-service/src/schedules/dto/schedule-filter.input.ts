import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class ScheduleFilterInput {
  @Field(() => ID, { nullable: true })
  doctorId?: string;

  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;
}
