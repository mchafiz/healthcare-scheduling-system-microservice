import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { Schedule } from "./dto/schedule.type";
import { CreateScheduleInput } from "./dto/create-schedule.input";
import { AuthGuard } from "../auth/auth.guard";
import { ScheduleService } from "./schedule.service";
import { PaginationInput } from "../common/dto/pagination.input";
import { PaginatedSchedules } from "../common/dto/paginated-schedules.type";
import { ScheduleFilterInput } from "./dto/schedule-filter.input";

@Resolver(() => Schedule)
@UseGuards(AuthGuard)
export class SchedulesResolver {
  constructor(private readonly schedulesService: ScheduleService) {}

  @Query(() => PaginatedSchedules)
  async schedules(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('filter', { nullable: true }) filter?: ScheduleFilterInput,
  ): Promise<PaginatedSchedules> {
    return this.schedulesService.findAll(pagination?.skip, pagination?.take, filter);
  }

  @Query(() => Schedule)
  async schedule(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<Schedule> {
    return this.schedulesService.findOne(id);
  }

  @Mutation(() => Schedule)
  async createSchedule(
    @Args("input") input: CreateScheduleInput,
  ): Promise<Schedule> {
    return this.schedulesService.create(input);
  }

  @Mutation(() => Boolean)
  async deleteSchedule(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.schedulesService.delete(id);
  }
}
