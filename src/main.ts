import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { rabbitmq } from './utils/rabbitmq';
import morgan from 'morgan';

const AVAILABLE_LOG_LEVELS: LogLevel[] = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];

function resolveLogLevels(): LogLevel[] {
  const explicitLogLevels = process.env.LOG_LEVEL
    ?.split(',')
    .map((level) => level.trim().toLowerCase())
    .filter((level): level is LogLevel => AVAILABLE_LOG_LEVELS.includes(level as LogLevel));

  if (explicitLogLevels && explicitLogLevels.length > 0) {
    return Array.from(new Set(explicitLogLevels));
  }

  const nodeEnv = process.env.NODE_ENV ?? 'development';

  if (nodeEnv === 'production') {
    return ['log', 'warn', 'error', 'fatal'];
  }

  if (nodeEnv === 'test') {
    return ['warn', 'error', 'fatal'];
  }

  return ['log', 'warn', 'error', 'debug', 'verbose', 'fatal'];
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: resolveLogLevels(),
  });

  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.log(message.trim(), 'HTTP'),
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(port);
  logger.log(`Server is running on http://localhost:${port}`);
  await rabbitmq();
  logger.log('RabbitMQ is connected');
}

bootstrap();
