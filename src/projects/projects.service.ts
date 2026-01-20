import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { createProjectsSchemaDto } from './dto/create.projects.dto';

@Injectable()
export class ProjectsService {
  constructor (private prisma: PrismaService) {};

  async create(
    body: createProjectsSchemaDto
  ) {
    try {
      typeof body.description === undefined?
        null : typeof body.description;
      return await this.prisma.project.create({
        data: {
          name: body.name,
          adminId: body.adminId,
          description: body?.description
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
