import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssetStatus } from '@prisma/client';
import { AssetsService } from '../src/assets/assets.service';
import { EmployeesService } from '../src/employees/employees.service';
import { CustodyService } from '../src/custody/custody.service';
import { AuditService } from '../src/audit/audit.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Multi-Tenant Isolation & IDOR Prevention Tests', () => {
  let mockPrisma: any;
  let mockAudit: Partial<AuditService>;
  let assetsService: AssetsService;
  let employeesService: EmployeesService;
  let custodyService: CustodyService;

  beforeEach(() => {
    mockAudit = {
      record: jest.fn().mockResolvedValue({} as any),
    };
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
      },
      asset: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      assetCategory: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      employee: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      custodyRecord: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      custodyRequest: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    assetsService = new AssetsService(mockPrisma as PrismaService, mockAudit as AuditService);
    employeesService = new EmployeesService(mockPrisma as PrismaService, mockAudit as AuditService);
    custodyService = new CustodyService(mockPrisma as PrismaService, mockAudit as AuditService);
  });

  describe('AssetsService Tenant Isolation', () => {
    it('findAll enforces organizationId filter strictly in database query', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([]);

      await assetsService.findAll('org-TENANT-A', 'laptop', AssetStatus.AVAILABLE);

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-TENANT-A',
            status: AssetStatus.AVAILABLE,
          }),
        }),
      );
    });

    it('findOne blocks cross-organization asset access (IDOR)', async () => {
      // Asset belongs to Tenant B, but caller is from Tenant A
      mockPrisma.asset.findFirst.mockResolvedValue(null);

      await expect(
        assetsService.findOne('org-TENANT-A', 'asset-uuid-belonging-to-tenant-B'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.asset.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'asset-uuid-belonging-to-tenant-B',
            organizationId: 'org-TENANT-A',
          },
        }),
      );
    });

    it('create rejects category belonging to a different tenant', async () => {
      mockPrisma.assetCategory.findFirst.mockResolvedValue(null); // Category not in Tenant A

      await expect(
        assetsService.create('org-TENANT-A', {
          assetNumber: 'AST-999',
          name: 'Server Rack',
          serialNumber: 'SR-1111',
          categoryId: 'category-of-tenant-B',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('remove blocks deletion when asset is actively held in custody', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue({
        id: 'asset-1',
        organizationId: 'org-TENANT-A',
        custodyRecords: [{ id: 'active-custody-1', returnedAt: null }],
      });

      await expect(
        assetsService.remove('org-TENANT-A', 'asset-1'),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.asset.delete).not.toHaveBeenCalled();
    });
  });

  describe('EmployeesService Tenant Isolation', () => {
    it('findAll enforces caller organizationId', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await employeesService.findAll('org-TENANT-A');

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-TENANT-A',
          }),
        }),
      );
    });

    it('findOne blocks viewing employees from another organization (IDOR)', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        employeesService.findOne('org-TENANT-A', 'emp-of-tenant-B'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.employee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'emp-of-tenant-B',
            organizationId: 'org-TENANT-A',
          },
        }),
      );
    });

    it('findMe looks up employee strictly within caller organization', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-1',
        name: 'Ahmed',
        email: 'ahmed@tenantA.com',
        organizationId: 'org-TENANT-A',
      });

      const profile = await employeesService.findMe('org-TENANT-A', 'ahmed@tenantA.com');

      expect(profile).toBeDefined();
      expect(mockPrisma.employee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: 'org-TENANT-A',
            email: 'ahmed@tenanta.com',
          },
        }),
      );
    });
  });

  describe('CustodyService Tenant Isolation', () => {
    it('findRecord blocks accessing custody records of another organization (IDOR)', async () => {
      mockPrisma.custodyRecord.findFirst.mockResolvedValue(null);

      await expect(
        custodyService.findRecord('org-TENANT-A', 'usr-1', ['ADMIN'], 'rec-tenant-B'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.custodyRecord.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'rec-tenant-B',
            organizationId: 'org-TENANT-A',
          },
        }),
      );
    });

    it('findRequest blocks accessing custody request of another organization (IDOR)', async () => {
      mockPrisma.custodyRequest.findFirst.mockResolvedValue(null);

      await expect(
        custodyService.findRequest('org-TENANT-A', 'usr-1', ['ADMIN'], 'req-tenant-B'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.custodyRequest.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'req-tenant-B',
            organizationId: 'org-TENANT-A',
          },
        }),
      );
    });
  });
});
