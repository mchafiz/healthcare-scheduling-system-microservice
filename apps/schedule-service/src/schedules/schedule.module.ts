import { Module } from "@nestjs/common";
import { SchedulesResolver } from "./schedule.resolver";
import { ScheduleService } from "./schedule.service";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [AuthModule, NotificationModule],
  providers: [ScheduleService, SchedulesResolver],
})
export class SchedulesModule {}
