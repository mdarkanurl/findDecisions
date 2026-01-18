import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Request, Response } from 'express';
import { createProjectsSchema } from './dto/create.projects.dto';

@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create (
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId: string = req.session.user.id;

      const { success, data, error } = createProjectsSchema.safeParse({
        adminId: userId,
        description: body.description
      });
      
      if (!success) {
        throw new BadRequestException(error.issues);
      }

      const response = await this.projectsService.create({
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
}
