import { Module } from '@nestjs/common';
import { invitesService } from './invites.service';
import { invitesController } from './invites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [invitesService],
  controllers: [invitesController],
  exports: [invitesService],
})
export class invitesModule {}
