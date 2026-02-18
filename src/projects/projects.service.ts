import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { createProjectsSchemaDto } from './dto/create.projects.dto';
import { UUID } from 'node:crypto';
import { UpdateProjectsSchemaDto } from './dto/create.update.projects.dto';
import { deleteCacheByPrefix, getCachedJson, setCachedJson } from '../utils/cache';

@Injectable()
export class ProjectsService {
  constructor (private prisma: PrismaService) {};

  private getProjectByIdCacheKey(id: UUID, userId: string): string {
    return `cache:projects:one:${id}:user:${userId}`;
  }

  private getPublicProjectsCacheKey(limit: number, skip: number): string {
    const page = Math.floor(skip / limit) + 1;
    return `cache:projects:public:page:${page}:limit:${limit}`;
  }

  private getUserProjectsCacheKey(limit: number, skip: number, userId: string): string {
    const page = Math.floor(skip / limit) + 1;
    return `cache:projects:user:${userId}:page:${page}:limit:${limit}`;
  }

  private async invalidateProjectCaches(userId: string, projectId?: UUID): Promise<void> {
    if (projectId) {
      await deleteCacheByPrefix(`cache:projects:one:${projectId}:`);
    }

    await deleteCacheByPrefix('cache:projects:public:');
    await deleteCacheByPrefix(`cache:projects:user:${userId}:`);
  }

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
      const cacheKey = this.getProjectByIdCacheKey(id, userId);
      const cached = await getCachedJson<Record<string, unknown>>(cacheKey);
      if (cached) {
        return cached;
      }

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
        await setCachedJson(cacheKey, data);
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
      const cacheKey = this.getPublicProjectsCacheKey(limit, skip);
      const cached = await getCachedJson<{
        data: Array<Record<string, unknown>>;
        pagination: {
          totalItems: number;
          currentPage: number;
          totalPages: number;
          pageSize: number;
        };
      }>(cacheKey);

      if (cached) {
        return cached;
      }

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

      const result = {
        data,
        pagination: {
          totalItems: total,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(total / limit),
          pageSize: limit
        }
      };

      await setCachedJson(cacheKey, result);
      return result;
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
      const cacheKey = this.getUserProjectsCacheKey(limit, skip, userId);
      const cached = await getCachedJson<{
        data: Array<Record<string, unknown>>;
        pagination: {
          totalItems: number;
          currentPage: number;
          totalPages: number;
          pageSize: number;
        };
      }>(cacheKey);

      if (cached) {
        return cached;
      }

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

      const result = {
        data,
        pagination: {
          totalItems: total,
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(total / limit),
          pageSize: limit
        }
      };

      await setCachedJson(cacheKey, result);
      return result;
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

      const result = await this.prisma.project.update({
        where: {
          adminId: userId,
          id
        },
        data: {
          ...body
        }
      });

      await this.invalidateProjectCaches(userId, id);
      return result;
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

      const result = await this.prisma.project.delete({
        where: {
          id,
          adminId: userId
        }
      });

      await this.invalidateProjectCaches(userId, id);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
