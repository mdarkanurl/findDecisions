import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('../utils/cache', () => ({
  deleteCacheByPrefix: jest.fn().mockResolvedValue(undefined),
  getCachedJson: jest.fn().mockResolvedValue(null),
  setCachedJson: jest.fn().mockResolvedValue(undefined),
}));

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: { project: any };

  const mockProject = {
    id: 'project-1',
    adminId: 'user-1',
    name: 'Test Project',
    description: 'Test description',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      project: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project', async () => {
      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create({
        name: 'Test Project',
        adminId: 'user-1',
        isPublic: true,
      });

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          adminId: 'user-1',
          isPublic: true,
          description: undefined,
        },
      });
    });
  });

  describe('getOneProject', () => {
    it('should return cached project if available', async () => {
      const { getCachedJson } = require('../utils/cache');
      getCachedJson.mockResolvedValueOnce(mockProject);

      const result = await service.getOneProject(
        'project-1' as any,
        'user-1',
      );

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).not.toHaveBeenCalled();
    });

    it('should return project when user is admin', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.getOneProject(
        'project-1' as any,
        'user-1',
      );

      expect(result).toEqual(mockProject);
    });

    it('should return project when project is public', async () => {
      prisma.project.findUnique.mockResolvedValue({ ...mockProject, isPublic: true });

      const result = await service.getOneProject(
        'project-1' as any,
        'other-user',
      );

      expect(result).toEqual({ ...mockProject, isPublic: true });
    });

    it('should throw NotFoundException when project is private and user is not admin', async () => {
      prisma.project.findUnique.mockResolvedValue({ ...mockProject, isPublic: false });

      await expect(
        service.getOneProject('project-1' as any, 'other-user'),
      ).rejects.toThrow('Project not found');
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.getOneProject('project-1' as any, 'user-1'),
      ).rejects.toThrow('Project not found');
    });
  });

  describe('getAllProject', () => {
    it('should return paginated public projects', async () => {
      prisma.project.count.mockResolvedValue(1);
      prisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.getAllProject(10, 0);

      expect(result.data).toEqual([mockProject]);
      expect(result.pagination.totalItems).toBe(1);
    });

    it('should throw NotFoundException when no public projects', async () => {
      prisma.project.count.mockResolvedValue(0);

      await expect(service.getAllProject(10, 0)).rejects.toThrow(
        'No projects found',
      );
    });
  });

  describe('getAllUserProject', () => {
    it('should return paginated user projects', async () => {
      prisma.project.count.mockResolvedValue(1);
      prisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.getAllUserProject(0, 10, 'user-1');

      expect(result.data).toEqual([mockProject]);
      expect(result.pagination.totalItems).toBe(1);
    });

    it('should throw NotFoundException when user has no projects', async () => {
      prisma.project.count.mockResolvedValue(0);

      await expect(service.getAllUserProject(0, 10, 'user-1')).rejects.toThrow(
        'No projects found',
      );
    });
  });

  describe('update', () => {
    it('should update project when user is admin', async () => {
      prisma.project.count.mockResolvedValue(1);
      prisma.project.update.mockResolvedValue({ ...mockProject, name: 'Updated Name' });

      const result = await service.update(
        'user-1',
        'project-1' as any,
        { name: 'Updated Name' },
      );

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.count.mockResolvedValue(0);

      await expect(
        service.update('user-1', 'project-1' as any, { name: 'Updated' }),
      ).rejects.toThrow('No projects found');
    });
  });

  describe('delete', () => {
    it('should delete project when user is admin', async () => {
      prisma.project.count.mockResolvedValue(1);
      prisma.project.delete.mockResolvedValue(mockProject);

      const result = await service.delete('user-1', 'project-1' as any);

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.count.mockResolvedValue(0);

      await expect(
        service.delete('user-1', 'project-1' as any),
      ).rejects.toThrow('No projects found');
    });
  });
});
