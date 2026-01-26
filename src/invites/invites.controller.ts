import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Res,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { invitesService } from './invites.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { createInviteSchema, createInviteSchemaDto } from './dto/create.invite.dto';

@Controller({ path: 'invites', version: '1' })
export class invitesController {
  constructor(private readonly invitesService: invitesService) {}
}
