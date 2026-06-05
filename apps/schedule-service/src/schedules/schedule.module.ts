import { Module } from "@nestjs/common";
import { SchedulesResolver } from "./schedule.resolver";
import { ScheduleService } from "./schedule.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [ScheduleService, SchedulesResolver],
})
export class SchedulesModule {}
