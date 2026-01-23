import { Module } from '@nestjs/common';
import { membersService } from './members.service';
import { membersController } from './members.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [membersService],
  controllers: [membersController],
  exports: [membersService],
})
export class membersModule {}
