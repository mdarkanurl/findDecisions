import { Injectable, NotFoundException } from '@nestjs/common';
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
    userId: UUID
  ) {
    try {
      const data = await this.prisma.projectInvite.findMany({
        where: {
          target: userId
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
}
