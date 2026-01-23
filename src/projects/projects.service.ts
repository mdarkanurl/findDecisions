import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { createProjectsSchemaDto } from './dto/create.projects.dto';
import { UUID } from 'node:crypto';
import { UpdateProjectsSchemaDto } from './dto/create.update.projects.dto';

@Injectable()
export class ProjectsService {
  constructor (private prisma: PrismaService) {};

  async create(
    body: createProjectsSchemaDto
  ) {
    try {
      return await this.prisma.project.create({
        data: {
          name: body.name,
          adminId: body.adminId,
          description: body?.description,
          isPublic: body.isPublic
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async getOneProject(id: UUID, userId: string) {
    try {
      const data = await this.prisma.project.findUnique({
        where: {
          id
        }
      });

      if(!data) {
        throw new NotFoundException('Project not found');
      }

      if(
        data.isPublic ||
        data.adminId === userId
      ) {
        return data;
      }

      throw new NotFoundException('Project not found');
    } catch (error) {
      throw error;
    }
  }

  async getAllProject(
    limit: number,
    skip: number
  ) {
    try {
      const total = await this.prisma.project.count({
        where: {
          isPublic: true
        }
      });

      if(total === 0) {
        throw new NotFoundException('No projects found')
      }

      const data = await this.prisma.project.findMany({
        skip,
        take: limit,
        where: {
          isPublic: true
        }
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

  async getAllUserProject(
    skip: number,
    limit: number,
    userId: string
  ) {
    try {
      const total = await this.prisma.project.count({
        where: {
          adminId: userId
        }
      });

      if(total === 0) {
        throw new NotFoundException('No projects found')
      }

      const data = await this.prisma.project.findMany({
        skip,
        take: limit,
        where: {
          adminId: userId,
        }
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

  async update(
    userId: string,
    id: UUID,
    body: UpdateProjectsSchemaDto
  ) {
    try {
      const projects = await this.prisma.project.count({
        where: {
          id,
          adminId: userId
        }
      });

      if(!projects) {
        throw new NotFoundException('No projects found');
      }

      return await this.prisma.project.update({
        where: {
          adminId: userId,
          id
        },
        data: {
          ...body
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(
    userId: string,
    id: UUID
  ) {
    try {
      const projects = await this.prisma.project.count({
        where: {
          id,
          adminId: userId
        }
      });

      if(!projects) {
        throw new NotFoundException('No projects found');
      }

      return await this.prisma.project.delete({
        where: {
          id,
          adminId: userId
        }
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
