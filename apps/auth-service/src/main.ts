import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: parseInt(process.env.AUTH_TCP_PORT) || 3003,
    },
  });

  await app.startAllMicroservices();
  await app.listen(parseInt(process.env.AUTH_HTTP_PORT) || 3001);

  console.log(
    `Auth Service HTTP running on port ${process.env.AUTH_HTTP_PORT || 3001}`,
  );
  console.log(
    `Auth Service TCP running on port ${process.env.AUTH_TCP_PORT || 3003}`,
  );
}

bootstrap();
