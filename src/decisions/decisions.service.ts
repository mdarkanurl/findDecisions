import { Injectable } from '@nestjs/common';
import { decisions, Prisma } from "../../generated/prisma/client";
import { PrismaService } from './../prisma/prisma.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { getDecisionsByIdDto } from './dto/get-decisions-by-id.dto';

@Injectable()
export class DecisionsService {
  constructor (private prisma: PrismaService) {};

  createDecisions(
    data: CreateDecisionDto
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

  getDecisionsById(
    id: getDecisionsByIdDto
  ): Promise<decisions | null> {
    return this.prisma.decisions.findUnique({
      where: {
        id
      }
    });
  }

  getAllDecisions(): Promise<decisions[] | null> {
    return this.prisma.decisions.findMany();
  }

  getDecisionsByEntities(
    data: null
  ) {
    
  }
}
