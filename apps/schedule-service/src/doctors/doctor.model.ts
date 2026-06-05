import { Module } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { DoctorResolver } from "./doctor.resolver";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [DoctorService, DoctorResolver],
  exports: [DoctorService],
})
export class DoctorsModule {}
