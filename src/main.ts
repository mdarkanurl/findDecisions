import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { rabbitmq } from './utils/rabbitmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
  await rabbitmq();
  console.log("Rabbitmq is connected");
}

bootstrap();
