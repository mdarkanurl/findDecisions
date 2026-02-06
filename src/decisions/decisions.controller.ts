
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  UsePipes,
  Get,
  Put,
  Query,
  Param,
  Delete
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createDecisionSchema, CreateDecisionSchemaDto } from './dto/create.decision.dto';
import { updateDecisionSchema, UpdateDecisionSchemaDto } from './dto/update.decision.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { DecisionsService } from './decisions.service';

@Controller({ path: 'decisions', version: '1' })
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createDecisionSchema))
  async create(
    @Body() body: CreateDecisionSchemaDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = (req as any).session.user.id;

      const result = await this.decisionsService.create(userId, body);

      return res.json({
        success: true,
        message: 'Decision created successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException((error as Error).message || "Failed to create decision");
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;
      const projectId = query.projectId;
      const userId = (req as any).session.user.id;

      if (!projectId) {
        throw new BadRequestException('Project ID is required');
      }

      const result = await this.decisionsService.findAll(userId, projectId, limit, skip);

      return res.json({
        success: true,
        message: 'Decisions found successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException((error as Error).message || "Failed to fetch decisions");
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = (req as any).session.user.id;
      const result = await this.decisionsService.findOne(userId, id);

      return res.json({
        success: true,
        message: 'Decision found successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException((error as Error).message || "Failed to fetch decision");
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateDecisionSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateDecisionSchemaDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = (req as any).session.user.id;
      const result = await this.decisionsService.update(userId, id, body);

      return res.json({
        success: true,
        message: 'Decision updated successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException((error as Error).message || "Failed to update decision");
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = (req as any).session.user.id;
      const result = await this.decisionsService.delete(userId, id);

      return res.json({
        success: true,
        message: 'Decision deleted successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException((error as Error).message || "Failed to delete decision");
    }
  }
}
