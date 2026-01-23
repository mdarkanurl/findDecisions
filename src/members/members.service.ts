import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class membersService {
  constructor (private prisma: PrismaService) {};
  
}
