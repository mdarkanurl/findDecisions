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
  Query
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Request, Response } from 'express';
import { createProjectsSchema } from './dto/create.projects.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UUID } from 'node:crypto';

@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create (
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId: string = req.session.user.id;

      const { success, data, error } = createProjectsSchema.safeParse({
        name: body.name,
        adminId: userId,
        description: body.description
      });
      
      if (!success) {
        throw new BadRequestException(error.issues);
      }

      const response = await this.projectsService.create({
        name: data.name,
        adminId: data.adminId,
        description: data.description
      });

      res.json({
        success: true,
        message: "The project has been created",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to create a project"); 
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneProject(
    @Param('id') id: UUID,
    @Res() res: Response
  ) {
    try {
      const response = await this.projectsService.getOneProject(id);

      res.json({
        success: true,
        message: "This is the project that found",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to create a project");
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProject(
    @Query() query: any,
    @Res() res: Response
  ) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10; 
      const skip = (page - 1) * limit; // page 3 => (3 - 1) * 10 = 20 skip
      
      const response = await this.projectsService
        .getAllProject(limit, skip);

      res.json({
        success: true,
        message: "These are projects that found",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to create a project");
    }
  }
}
