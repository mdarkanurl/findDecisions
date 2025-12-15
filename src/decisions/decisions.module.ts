import { Module } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { DecisionsController } from './decisions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DecisionsService],
  controllers: [DecisionsController],
  exports: [DecisionsService],
})
export class DecisionsModule {}
