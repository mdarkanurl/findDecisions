import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createInviteSchemaDto } from './dto/create.invite.dto';
import { UUID } from 'crypto';

@Injectable()
export class invitesService {
  constructor (private prisma: PrismaService) {};
  
  async createInvite(
    body: createInviteSchemaDto,
    userId: UUID
  ) {
    try {
      const projects = await this.prisma.project.findUnique({
        where: {
          id: body.projectId,
          adminId: body.invitersId
        }
      });

      if(!projects) {
        throw new NotFoundException();
      }

      const currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() + 5);

      return await this.prisma.projectInvite.create({
        data: {
          projectId: body.projectId,
          invitedBy: userId,
          target: body.invitersId,
          expiresAt: currentDate
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllInvites(
    userId: UUID
  ) {
    try {
      const data = await this.prisma.projectInvite.findMany({
        where: {
          invitedBy: userId
        }
      });

      if(!data.length) {
        throw new NotFoundException();
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllInvitesWhereYouInvited(
    userId: UUID,
    limit: number,
    skip: number
  ) {
    try {
      const total = await this.prisma.projectInvite.count({
        where: {
          target: userId
        }
      });

      if(!total) {
        throw new NotFoundException();
      }

      const data = await this.prisma.projectInvite.findMany({
        skip,
        take: limit,
        where: {
          target: userId
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

  async acceptInvite(
    userId: UUID,
    inviteId: UUID
  ) {
    try {
      // Find the invite
      const invite = await this.prisma.projectInvite.findUnique({
        where: { id: inviteId },
        select: {
          id: true,
          target: true,
          status: true,
          expiresAt: true,
        },
      });

      if (!invite) {
        throw new NotFoundException();
      }

      if (invite.target !== userId) {
        throw new ForbiddenException('Invite does not belong to this user');
      }

      if (invite.status !== 'PENDING') {
        throw new BadRequestException('Invite is not pending');
      }

      if (invite.expiresAt <= new Date()) {
        throw new BadRequestException('Invite expired');
      }
      
      return await this.prisma.projectInvite.update({
        where: { id: inviteId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
    } catch (error) {
      throw error; 
    }
  }

  async rejectInvite(
    userId: UUID,
    inviteId: UUID
  ) {
    try {
      const invite = await this.prisma.projectInvite.findUnique({
        where: { id: inviteId },
        select: {
          id: true,
          target: true,
          status: true,
          expiresAt: true,
        },
      });

      if (!invite) {
        throw new NotFoundException();
      }

      if (invite.target !== userId) {
        throw new ForbiddenException('Invite does not belong to this user');
      }

      if (invite.status !== 'PENDING') {
        throw new BadRequestException('Invite is not pending');
      }

      if (invite.expiresAt <= new Date()) {
        throw new BadRequestException('Invite expired');
      }
      
      return await this.prisma.projectInvite.update({
        where: { id: inviteId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
    } catch (error) {
      throw error; 
    }
  }
}
