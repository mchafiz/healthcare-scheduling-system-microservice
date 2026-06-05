import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(parseInt(process.env.SCHEDULE_HTTP_PORT) || 3002);
  console.log(
    `Schedule Service running on port ${process.env.SCHEDULE_HTTP_PORT || 3002}`,
  );
}

bootstrap();
