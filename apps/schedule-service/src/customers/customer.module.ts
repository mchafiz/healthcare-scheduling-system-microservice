import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomersResolver } from "./customer.resolver";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [CustomerService, CustomersResolver],
  exports: [CustomerService],
})
export class CustomersModule {}
