import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DecisionsModule } from './decisions/decisions.module';
import { auth } from "./lib/auth";
import { LocalAuthModule } from "./auth/auth.module";
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: `.env`,
    }),
    PrismaModule,
    DecisionsModule,
    LocalAuthModule,
    AuthModule.forRoot(auth),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}