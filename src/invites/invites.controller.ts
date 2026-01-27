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
import { Request, Response } from 'express';
import { UUID } from 'crypto';

@Controller({ path: 'invites', version: '1' })
export class invitesController {
  constructor(private readonly invitesService: invitesService) {}
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInvite(
    @Body(
      new ZodValidationPipe(createInviteSchema)
    ) body: createInviteSchemaDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId: UUID = req.session.user.id;
      const response = await this.invitesService
        .createInvite(body, userId);

      res.json({
        success: true,
        message: "The invite has created",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to create the invite");
    }
  }

  @Get(':projectId')
  async getAllInvites(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId: UUID = req.session.user.id;

      const response = await this.invitesService
        .getAllInvites(userId);

      res.json({
        success: true,
        message: "These are invite that found",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to get all invite");
    }
  }

  @Get('me')
  async getAllInvitesWhereYouInvited(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId: UUID = req.session.user.id;

      const response = await this.invitesService
        .getAllInvitesWhereYouInvited(userId);

      res.json({
        success: true,
        message: "These are invite that found",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to get all invite");
    }
  }
}
