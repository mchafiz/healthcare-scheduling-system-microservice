import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Doctor } from '../../doctors/dto/doctor.type';

@ObjectType()
export class PaginatedDoctors {
  @Field(() => [Doctor])
  data: Doctor[];

  @Field(() => Int)
  total: number;
}
