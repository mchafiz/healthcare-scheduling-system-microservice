import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || "localhost",
          port: parseInt(process.env.AUTH_TCP_PORT) || 3003,
        },
      },
    ]),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, ClientsModule],
})
export class AuthModule {}
