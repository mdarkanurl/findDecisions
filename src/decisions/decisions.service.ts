import { Injectable } from '@nestjs/common';
import { decisions, Prisma } from "../../generated/prisma/client";
import { PrismaService } from './../prisma/prisma.service';
import { createDecisionsSchema } from '../schemas/decision.schema';
import z from 'zod';

@Injectable()
export class DecisionsService {
  constructor (private prisma: PrismaService) {};

  createDecisions(
    data: z.infer<typeof createDecisionsSchema>
  ): Promise<decisions | null> {
    return this.prisma.decisions.create({
      data: {
        action: data.action,
        outcome: data.outcome,
        actorType: data.actorType,
        reason: data.reason,
        context: data.context === undefined || data.context === null
          ? Prisma.JsonNull
          : data.context,
        actorId: data.actorId === undefined || data.actorId === null
          ? null
          : data.actorId,
      }
    });
  }
}
