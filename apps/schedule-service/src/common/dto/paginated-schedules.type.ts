import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Schedule } from '../../schedules/dto/schedule.type';

@ObjectType()
export class PaginatedSchedules {
  @Field(() => [Schedule])
  data: Schedule[];

  @Field(() => Int)
  total: number;
}
