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

  async getAllProject(
    limit: number,
    skip: number
  ) {
    try {
      const total = await this.prisma.project.count();

      if(total === 0) {
        throw new NotFoundException('No projects found')
      }

      const data = await this.prisma.project.findMany({
        skip,
        take: limit
      });

      return {
        data,
        pagination: {
          totalItems: total,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(total / limit),
          pageSize: limit
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
