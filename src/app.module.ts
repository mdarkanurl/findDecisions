import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DecisionsModule } from './decisions/decisions.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}