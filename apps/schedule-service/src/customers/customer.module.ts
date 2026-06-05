import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomersResolver } from "./customer.resolver";

@Module({
  providers: [CustomerService, CustomersResolver],
  exports: [CustomerService],
})
export class CustomersModule {}
