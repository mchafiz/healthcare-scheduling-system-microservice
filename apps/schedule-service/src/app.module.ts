import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { BullModule } from "@nestjs/bull";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { join } from "path";
import { DoctorsModule } from "./doctors/doctor.model";
import { CustomersModule } from "./customers/customer.module";
import { SchedulesModule } from "./schedules/schedule.module";
import { NotificationModule } from "./notification/notification.module";
import { CacheModule } from "./cache/cache.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(
        process.cwd(),
        "apps/schedule-service/src/schema.gql",
      ),
      sortSchema: true,
      context: ({ req }) => ({ req }),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    DoctorsModule,
    SchedulesModule,
    NotificationModule,
    CacheModule,
  ],
})
export class AppModule {}
