import { Test, TestingModule } from '@nestjs/testing';
import { invitesService } from './invites.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('invitesService', () => {
  let service: invitesService;
  let prisma: { project: any; projectInvite: any };

  const mockInvite = {
    id: 'invite-1',
    projectId: 'project-1',
    invitedBy: 'user-1',
    target: 'user-2',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    respondedAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findUnique: jest.fn(),
      },
      projectInvite: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        invitesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<invitesService>(invitesService);
    jest.clearAllMocks();
  });

  describe('createInvite', () => {
    it('should create an invite when user is project admin', async () => {
      prisma.project.findUnique.mockResolvedValue({ id: 'project-1', adminId: 'user-1' });
      prisma.projectInvite.create.mockResolvedValue(mockInvite);

      const result = await service.createInvite(
        { projectId: 'project-1', invitersId: 'user-1' },
        'user-1' as any,
      );

      expect(result).toEqual(mockInvite);
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.createInvite(
          { projectId: 'project-1', invitersId: 'user-1' },
          'user-1' as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllInvites', () => {
    it('should return all invites sent by user', async () => {
      prisma.projectInvite.findMany.mockResolvedValue([mockInvite]);

      const result = await service.getAllInvites('user-1' as any);

      expect(result).toEqual([mockInvite]);
    });

    it('should throw NotFoundException when no invites found', async () => {
      prisma.projectInvite.findMany.mockResolvedValue([]);

      await expect(service.getAllInvites('user-1' as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllInvitesWhereYouInvited', () => {
    it('should return paginated invites received by user', async () => {
      prisma.projectInvite.count.mockResolvedValue(1);
      prisma.projectInvite.findMany.mockResolvedValue([mockInvite]);

      const result = await service.getAllInvitesWhereYouInvited(
        'user-2' as any,
        10,
        0,
      );

      expect(result.data).toEqual([mockInvite]);
      expect(result.pagination.totalItems).toBe(1);
    });

    it('should throw NotFoundException when no invites', async () => {
      prisma.projectInvite.count.mockResolvedValue(0);

      await expect(
        service.getAllInvitesWhereYouInvited('user-2' as any, 10, 0),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('acceptInvite', () => {
    it('should accept invite successfully', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      prisma.projectInvite.update.mockResolvedValue({
        ...mockInvite,
        status: 'ACCEPTED',
        respondedAt: new Date(),
      });

      const result = await service.acceptInvite('user-2' as any, 'invite-1' as any);

      expect(result.status).toBe('ACCEPTED');
    });

    it('should throw NotFoundException when invite not found', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptInvite('user-2' as any, 'invite-1' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when invite does not belong to user', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        target: 'other-user',
      });

      await expect(
        service.acceptInvite('user-2' as any, 'invite-1' as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when invite is not pending', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        status: 'ACCEPTED',
      });

      await expect(
        service.acceptInvite('user-2' as any, 'invite-1' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when invite is expired', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.acceptInvite('user-2' as any, 'invite-1' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectInvite', () => {
    it('should reject invite successfully', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      prisma.projectInvite.update.mockResolvedValue({
        ...mockInvite,
        status: 'REJECTED',
        respondedAt: new Date(),
      });

      const result = await service.rejectInvite('user-2' as any, 'invite-1' as any);

      expect(result.status).toBe('REJECTED');
    });

    it('should throw NotFoundException when invite not found', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.rejectInvite('user-2' as any, 'invite-1' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revokeInvite', () => {
    it('should revoke invite successfully', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        invitedBy: 'user-1',
        status: 'PENDING',
      });
      prisma.projectInvite.update.mockResolvedValue({
        ...mockInvite,
        status: 'REVOKED',
        respondedAt: new Date(),
      });

      const result = await service.revokeInvite('user-1' as any, 'invite-1' as any);

      expect(result.status).toBe('REVOKED');
    });

    it('should throw NotFoundException when invite not found', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeInvite('user-1' as any, 'invite-1' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user did not send invite', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        invitedBy: 'other-user',
      });

      await expect(
        service.revokeInvite('user-1' as any, 'invite-1' as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when invite is not pending', async () => {
      prisma.projectInvite.findUnique.mockResolvedValue({
        ...mockInvite,
        invitedBy: 'user-1',
        status: 'ACCEPTED',
      });

      await expect(
        service.revokeInvite('user-1' as any, 'invite-1' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
