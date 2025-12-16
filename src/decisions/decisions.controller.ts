import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { CreateDecisionDto, createDecisionsSchema } from "./dto/create-decision.dto";
import { decisions } from '../../generated/prisma/client';
import z from 'zod';
import { getDecisionsByIdDto, getDecisionsByIdSchema } from './dto/get-decisions-by-id.dto';

@Controller({ path: 'decisions', version: '1' })
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDecisionsSchema))
  createDecisions(
    @Body() body: CreateDecisionDto,
  ): Promise<decisions | null> {
    return this.decisionsService.createDecisions(body);
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(getDecisionsByIdSchema))
  getDecisionsById(
    @Param('id') id: getDecisionsByIdDto
  ): Promise<decisions | null> {
    return this.decisionsService.getDecisionsById(id);
  }
}
