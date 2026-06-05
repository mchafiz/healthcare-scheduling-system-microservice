import { Module } from "@nestjs/common";
import { SchedulesResolver } from "./schedule.resolver";
import { ScheduleService } from "./schedule.service";

@Module({
  providers: [ScheduleService, SchedulesResolver],
})
export class SchedulesModule {}
