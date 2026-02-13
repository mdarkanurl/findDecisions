import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateDecisionSchemaDto } from './dto/create.decision.dto';
import { UpdateDecisionSchemaDto } from './dto/update.decision.dto';
import { deleteCacheByPrefix, getCachedJson, setCachedJson } from '../utils/cache';

@Injectable()
export class DecisionsService {
  constructor(private prisma: PrismaService) { };

  private getDecisionListCacheKey(
    projectId: string,
    userId: string,
    limit: number,
    skip: number,
  ): string {
    const page = Math.floor(skip / limit) + 1;
    return `cache:decisions:list:project:${projectId}:user:${userId}:page:${page}:limit:${limit}`;
  }

  private getDecisionByIdCacheKey(id: string, userId: string): string {
    return `cache:decisions:one:${id}:user:${userId}`;
  }

  private async invalidateDecisionCaches(projectId: string, decisionId?: string): Promise<void> {
    await deleteCacheByPrefix(`cache:decisions:list:project:${projectId}:`);

    if (decisionId) {
      await deleteCacheByPrefix(`cache:decisions:one:${decisionId}:`);
    }
  }

  async create(
    userId: string,
    body: CreateDecisionSchemaDto
  ) {
    try {
      const project = await this.prisma.project.findFirst({
        where: {
          id: body.projectId,
          OR: [
            { adminId: userId },
            {
              members: {
                some: {
                  memberId: userId,
                  status: 'active'
                }
              }
            }
          ]
        }
      });

      if (!project) {
        throw new Error('Project not found or user is not authorized');
      }

      const isProjectAdmin = project.adminId === userId;

      const result = await this.prisma.decision.create({
        data: {
          projectId: body.projectId,
          action: body.action,
          reason: body.reason,
          outcome: body.outcome,
          context: body.context ?? {},
          actorId: userId,
          actorType: isProjectAdmin ? 'admin' : 'member'
        }
      });

      await this.invalidateDecisionCaches(body.projectId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    userId: string,
    projectId: string,
    limit: number,
    skip: number
  ) {
    try {
      const cacheKey = this.getDecisionListCacheKey(projectId, userId, limit, skip);
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

      const whereClause: any = {
        projectId,
        project: {
          OR: [
            { adminId: userId },
            {
              members: {
                some: {
                  memberId: userId,
                  status: 'active'
                }
              }
            }
          ]
        }
      };

      const [total, data] = await this.prisma.$transaction([
        this.prisma.decision.count({ where: whereClause }),
        this.prisma.decision.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
      ]);

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

  async findOne(
    userId: string,
    id: string
  ) {
    try {
      const cacheKey = this.getDecisionByIdCacheKey(id, userId);
      const cached = await getCachedJson<Record<string, unknown>>(cacheKey);
      if (cached) {
        return cached;
      }

      const decision = await this.prisma.decision.findFirst({
        where: {
          id,
          project: {
            OR: [
              { adminId: userId },
              {
                members: {
                  some: {
                    memberId: userId,
                    status: 'active'
                  }
                }
              }
            ]
          }
        }
      });

      if (!decision) {
        throw new Error('Decision not found or access denied');
      }

      await setCachedJson(cacheKey, decision);
      return decision;
    } catch (error) {
      throw error;
    }
  }

  async update(
    userId: string,
    id: string,
    body: UpdateDecisionSchemaDto
  ) {
    try {
      const decision = await this.prisma.decision.findUnique({
        where: { id },
        include: {
          project: {
            select: { adminId: true }
          }
        }
      });

      if (!decision) {
        throw new Error('Decision not found');
      }

      const isProjectAdmin = decision.project.adminId === userId;
      const isActor = decision.actorId === userId;

      if (!isProjectAdmin && !isActor) {
        throw new Error('You are not authorized to update this decision');
      }

      const result = await this.prisma.decision.update({
        where: { id },
        data: { ...body }
      });

      await this.invalidateDecisionCaches(decision.projectId, id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(
    userId: string,
    id: string
  ) {
    try {
      const decision = await this.prisma.decision.findUnique({
        where: { id },
        include: {
          project: {
            select: { adminId: true }
          }
        }
      });

      if (!decision) {
        throw new Error('Decision not found');
      }

      const isProjectAdmin = decision.project.adminId === userId;
      const isActor = decision.actorId === userId;

      if (!isProjectAdmin && !isActor) {
        throw new Error('You are not authorized to delete this decision');
      }

      const result = await this.prisma.decision.delete({
        where: { id }
      });

      await this.invalidateDecisionCaches(decision.projectId, id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
