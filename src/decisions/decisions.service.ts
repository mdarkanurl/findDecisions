import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateDecisionSchemaDto } from './dto/create.decision.dto';
import { UpdateDecisionSchemaDto } from './dto/update.decision.dto';

@Injectable()
export class DecisionsService {
  constructor(private prisma: PrismaService) { };

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

      return await this.prisma.decision.create({
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

  async findOne(
    userId: string,
    id: string
  ) {
    try {
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

      return await this.prisma.decision.update({
        where: { id },
        data: { ...body }
      });
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

      return await this.prisma.decision.delete({
        where: { id }
      });
    } catch (error) {
      throw error;
    }
  }
}
