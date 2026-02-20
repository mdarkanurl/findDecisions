import { Test, TestingModule } from '@nestjs/testing';
import { DecisionsService } from './decisions.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('../utils/cache', () => ({
  deleteCacheByPrefix: jest.fn().mockResolvedValue(undefined),
  getCachedJson: jest.fn().mockResolvedValue(null),
  setCachedJson: jest.fn().mockResolvedValue(undefined),
}));

describe('DecisionsService', () => {
  let service: DecisionsService;
  let prisma: { project: any; decision: any; $transaction: any };

  const mockDecision = {
    id: 'decision-1',
    projectId: 'project-1',
    action: 'Approve',
    reason: 'Reason here',
    outcome: 'Approved',
    context: {},
    actorId: 'user-1',
    actorType: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProject = {
    id: 'project-1',
    adminId: 'user-1',
    name: 'Test Project',
    description: 'Test',
    isPublic: true,
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findFirst: jest.fn(),
      },
      decision: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (promises: any[]) => {
        return Promise.all(promises);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<DecisionsService>(DecisionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a decision when user is admin', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.decision.create.mockResolvedValue(mockDecision);

      const result = await service.create('user-1', {
        projectId: 'project-1',
        action: 'Approve',
        reason: 'Reason here',
        outcome: 'Approved',
      });

      expect(result).toEqual(mockDecision);
      expect(prisma.decision.create).toHaveBeenCalled();
    });

    it('should throw error when project not found', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', {
          projectId: 'project-1',
          action: 'Approve',
          reason: 'Reason here',
          outcome: 'Approved',
        }),
      ).rejects.toThrow('Project not found or user is not authorized');
    });
  });

  describe('findAll', () => {
    it('should return paginated decisions', async () => {
      const mockDecisionList = [mockDecision];
      prisma.decision.count.mockResolvedValue(1);
      prisma.decision.findMany.mockResolvedValue(mockDecisionList);

      const result = await service.findAll('user-1', 'project-1', 10, 0);

      expect(result.data).toEqual(mockDecisionList);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return cached decision if available', async () => {
      const { getCachedJson } = require('../utils/cache');
      getCachedJson.mockResolvedValueOnce(mockDecision);

      const result = await service.findOne('user-1', 'decision-1');

      expect(result).toEqual(mockDecision);
      expect(prisma.decision.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch decision from database when not cached', async () => {
      prisma.decision.findFirst.mockResolvedValue(mockDecision);

      const result = await service.findOne('user-1', 'decision-1');

      expect(result).toEqual(mockDecision);
      expect(prisma.decision.findFirst).toHaveBeenCalled();
    });

    it('should throw error when decision not found', async () => {
      prisma.decision.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'decision-1')).rejects.toThrow(
        'Decision not found or access denied',
      );
    });
  });

  describe('update', () => {
    it('should update decision when user is admin', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        ...mockDecision,
        project: { adminId: 'user-1' },
      });
      prisma.decision.update.mockResolvedValue({
        ...mockDecision,
        reason: 'Updated Reason',
      });

      const result = await service.update('user-1', 'decision-1', {
        reason: 'Updated Reason',
      });

      expect(result.reason).toBe('Updated Reason');
    });

    it('should throw error when user is not authorized', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        ...mockDecision,
        actorId: 'other-user',
        project: { adminId: 'admin-user' },
      });

      await expect(
        service.update('user-1', 'decision-1', { reason: 'Update' }),
      ).rejects.toThrow('You are not authorized to update this decision');
    });
  });

  describe('delete', () => {
    it('should delete decision when user is admin', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        ...mockDecision,
        project: { adminId: 'user-1' },
      });
      prisma.decision.delete.mockResolvedValue(mockDecision);

      const result = await service.delete('user-1', 'decision-1');

      expect(result).toEqual(mockDecision);
    });

    it('should throw error when decision not found', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      await expect(service.delete('user-1', 'decision-1')).rejects.toThrow(
        'Decision not found',
      );
    });
  });
});
