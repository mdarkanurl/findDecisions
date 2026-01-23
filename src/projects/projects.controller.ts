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
import { ProjectsService } from './projects.service';
import { Request, Response } from 'express';
import { createProjectsSchema } from './dto/create.projects.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UUID } from 'node:crypto';
import { updateProjectsSchema, UpdateProjectsSchemaDto } from './dto/create.update.projects.dto';

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
        description: body.description,
        isPublic: body.isPublic
      });
      
      if (!success) {
        throw new BadRequestException(error.issues);
      }

      const response = await this.projectsService.create({
        name: data.name,
        adminId: data.adminId,
        description: data.description,
        isPublic: data.isPublic
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
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const userId: string = req.session.user.id;
      const response = await this.projectsService
        .getOneProject(id, userId);

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
      throw new InternalServerErrorException("Falied to get a project");
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
      throw new InternalServerErrorException("Falied to get all project");
    }
  }

  @Get('mine')
  @HttpCode(HttpStatus.OK)
  async getAllUserProject(
    @Query() query: any,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10; 
      const skip = (page - 1) * limit;
      const userId: string = req.session.user.id;

      const response = await this.projectsService
        .getAllUserProject(skip, limit, userId);

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
      throw new InternalServerErrorException("Falied to get all user's project");
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Body(
      new ZodValidationPipe(updateProjectsSchema)
    ) body: UpdateProjectsSchemaDto,
    @Param('id') id: UUID,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const userId: string = req.session.user.id;

      const response = await this.projectsService
        .update(userId, id, body);

      res.json({
        success: true,
        message: "The project has updated",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to update the project");
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: UUID
  ) {
    try {
      const userId: string = req.session.user.id;
      const response = await this.projectsService
        .delete(userId, id);

      res.json({
        success: true,
        message: "The project has deleted",
        data: response,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Falied to delete the project");
    }
  }
}
