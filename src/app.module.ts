import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { DecisionsModule } from './decisions/decisions.module';
import { ProjectsModule } from './projects/projects.module';
import { auth } from "./lib/auth";
import { LocalAuthModule } from "./auth/auth.module";
import config from './config';
import { invitesModule } from './invites/invites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: `.env`,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('RATE_LIMIT_TTL', 60_000),
          limit: configService.get<number>('RATE_LIMIT_LIMIT', 100),
        },
      ],
    }),
    PrismaModule,
    DecisionsModule,
    ProjectsModule,
    invitesModule,
    LocalAuthModule,
    AuthModule.forRoot({ auth }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
