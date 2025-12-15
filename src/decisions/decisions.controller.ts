import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { createDecisionsSchema } from "../schemas/decision.schema";
import { decisions, Prisma } from '../../generated/prisma/client';
import z from 'zod';

@Controller({ path: 'decisions', version: '1' })
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDecisionsSchema))
  createDecisions(
    @Body() body: z.infer<typeof createDecisionsSchema>,
  ): Promise<decisions | null> {
    return this.decisionsService.createDecisions(body);
  }
}
