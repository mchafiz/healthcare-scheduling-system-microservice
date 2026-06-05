import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Customer } from '../../customers/dto/customer.type';

@ObjectType()
export class PaginatedCustomers {
  @Field(() => [Customer])
  data: Customer[];

  @Field(() => Int)
  total: number;
}
