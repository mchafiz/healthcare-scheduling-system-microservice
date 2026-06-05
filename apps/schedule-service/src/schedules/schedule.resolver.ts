import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { Schedule } from "./dto/schedule.type";
import { CreateScheduleInput } from "./dto/create-schedule.input";
import { AuthGuard } from "../auth/auth.guard";
import { ScheduleService } from "./schedule.service";

@Resolver(() => Schedule)
@UseGuards(AuthGuard)
export class SchedulesResolver {
  constructor(private readonly schedulesService: ScheduleService) {}

  @Query(() => [Schedule])
  async schedules(): Promise<Schedule[]> {
    return this.schedulesService.findAll();
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
