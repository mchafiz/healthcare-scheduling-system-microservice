import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { Customer } from "./dto/customer.type";
import { CreateCustomerInput } from "./dto/create-customer.input";
import { UpdateCustomerInput } from "./dto/update-customer.input";
import { CustomerService } from "./customer.service";
import { AuthGuard } from "apps/schedule-service/src/auth/auth.guard";
import { PaginationInput } from "../common/dto/pagination.input";
import { PaginatedCustomers } from "../common/dto/paginated-customers.type";

@Resolver(() => Customer)
@UseGuards(AuthGuard)
export class CustomersResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => PaginatedCustomers)
  async customers(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedCustomers> {
    return this.customerService.findAll(pagination?.skip, pagination?.take);
  }

  @Query(() => Customer)
  async customer(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Mutation(() => Customer)
  async createCustomer(
    @Args("input") input: CreateCustomerInput,
  ): Promise<Customer> {
    return this.customerService.create(input);
  }

  @Mutation(() => Customer)
  async updateCustomer(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateCustomerInput,
  ): Promise<Customer> {
    return this.customerService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteCustomer(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.customerService.delete(id);
  }
}
