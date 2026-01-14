import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class DecisionsService {
  constructor (private prisma: PrismaService) {};

}
