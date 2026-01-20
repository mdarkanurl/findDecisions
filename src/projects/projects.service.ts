import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { createProjectsSchemaDto } from './dto/create.projects.dto';
import { UUID } from 'node:crypto';

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

  async getOneProject(id: UUID) {
    try {
      const res = await this.prisma.project.findUnique({
        where: {
          id: id
        }
      });

      if(!res) {
        throw new NotFoundException('Project not found');
      }

      return res;
    } catch (error) {
      throw error;
    }
  }
}
