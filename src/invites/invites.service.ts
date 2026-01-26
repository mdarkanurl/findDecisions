import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createInviteSchemaDto } from './dto/create.invite.dto';
import { UUID } from 'crypto';

@Injectable()
export class invitesService {
  constructor (private prisma: PrismaService) {};
  
}
