import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { join } from "path";
import { DoctorsModule } from "./doctors/doctor.model";
import { CustomersModule } from "./customers/customer.module";
import { SchedulesModule } from "./schedules/schedule.module";

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
    PrismaModule,
    AuthModule,
    CustomersModule,
    DoctorsModule,
    SchedulesModule,
  ],
})
export class AppModule {}
