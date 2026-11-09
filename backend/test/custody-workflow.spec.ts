import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AssetStatus, CustodyRequestStatus, CustodyStatus } from '@prisma/client';
import { CustodyService } from '../src/custody/custody.service';
import { AuditService } from '../src/audit/audit.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Custody Workflow & Integrity Tests', () => {
  let mockPrisma: any;
  let mockAudit: Partial<AuditService>;
  let custodyService: CustodyService;

  beforeEach(() => {
    mockAudit = {
      record: jest.fn().mockResolvedValue({} as any),
    };
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
      },
      employee: {
        findFirst: jest.fn(),
      },
      asset: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      custodyRecord: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      custodyRequest: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      custodyHistory: {
        create: jest.fn(),
      },
      maintenanceRequest: {
        findFirst: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    custodyService = new CustodyService(mockPrisma as PrismaService, mockAudit as AuditService);
  });

  describe('Custody Requests', () => {
    it('createRequest links caller employee profile automatically and rejects if no employee profile exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'user@tenantA.com' });
      mockPrisma.employee.findFirst.mockResolvedValue(null); // No employee profile found

      await expect(
        custodyService.createRequest('org-1', 'user-1', {
          category: 'Laptops',
          reason: 'Need for development',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('createRequest successfully binds requesterId to verified employee profile', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'employee@tenantA.com' });
      mockPrisma.employee.findFirst.mockResolvedValue({ id: 'emp-verified-1', name: 'Khalid' });
      mockPrisma.custodyRequest.create.mockResolvedValue({
        id: 'req-1',
        requesterId: 'emp-verified-1',
        organizationId: 'org-1',
        status: CustodyRequestStatus.PENDING,
      });

      const req = await custodyService.createRequest('org-1', 'user-1', {
        category: 'Laptops',
        reason: 'Work requirement',
      });

      expect(req).toBeDefined();
      expect(mockPrisma.custodyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: 'org-1',
            requesterId: 'emp-verified-1',
            status: CustodyRequestStatus.PENDING,
          }),
        }),
      );
    });

    it('adminApproveRequest blocks approving an already approved or rejected request', async () => {
      mockPrisma.custodyRequest.findFirst.mockResolvedValue({
        id: 'req-1',
        organizationId: 'org-1',
        status: CustodyRequestStatus.APPROVED, // Already approved
      });

      await expect(
        custodyService.adminApproveRequest('org-1', 'req-1', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('blocks regular employee from viewing another employee custody request', async () => {
      mockPrisma.custodyRequest.findFirst.mockResolvedValue({
        id: 'req-other',
        organizationId: 'org-1',
        requesterId: 'emp-other-user',
      });
      // User employee profile is emp-1
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'emp1@domain.com' });
      mockPrisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

      await expect(
        custodyService.findRequest('org-1', 'usr-1', ['EMPLOYEE'], 'req-other'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('blocks employee from replying or modifying a finalized custody request', async () => {
      mockPrisma.custodyRequest.findFirst.mockResolvedValue({
        id: 'req-done',
        organizationId: 'org-1',
        requesterId: 'emp-1',
        status: CustodyRequestStatus.ASSIGNED, // Completed / finalized
      });
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'emp1@domain.com' });
      mockPrisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

      await expect(
        custodyService.replyRequest('org-1', 'usr-1', ['EMPLOYEE'], 'req-done', 'I want another color'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Custody Assignment & Return', () => {
    it('assign rejects assigning an asset that is not AVAILABLE', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue({
        id: 'asset-1',
        organizationId: 'org-1',
        status: AssetStatus.ACTIVE, // Already assigned or in use
      });

      await expect(
        custodyService.assign('org-1', {
          assetId: 'asset-1',
          employeeId: 'emp-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('returnRecord blocks returning an already returned custody record', async () => {
      mockPrisma.custodyRecord.findFirst.mockResolvedValue({
        id: 'record-1',
        organizationId: 'org-1',
        status: CustodyStatus.RETURNED,
        returnedAt: new Date(), // Already returned
      });

      await expect(
        custodyService.returnRecord('org-1', 'record-1', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
