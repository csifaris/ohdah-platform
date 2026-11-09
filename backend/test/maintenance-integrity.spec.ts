import { AssetStatus, MaintenanceStatus } from '@prisma/client';
import { MaintenanceService } from '../src/maintenance/maintenance.service';
import { AuditService } from '../src/audit/audit.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Maintenance Integrity & Asset State Tests', () => {
  let mockPrisma: any;
  let mockAudit: Partial<AuditService>;
  let maintenanceService: MaintenanceService;

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
        findFirst: jest.fn(),
      },
      maintenanceRequest: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
    };

    maintenanceService = new MaintenanceService(
      mockPrisma as PrismaService,
      mockAudit as AuditService,
    );
  });

  it('restores asset to ACTIVE when maintenance is completed IF active custody exists', async () => {
    mockPrisma.maintenanceRequest.findFirst.mockResolvedValue({
      id: 'maint-1',
      organizationId: 'org-1',
      assetId: 'asset-1',
      status: MaintenanceStatus.IN_PROGRESS,
    });
    mockPrisma.maintenanceRequest.update.mockResolvedValue({
      id: 'maint-1',
      assetId: 'asset-1',
      status: MaintenanceStatus.COMPLETED,
    });
    // Active custody exists!
    mockPrisma.custodyRecord.findFirst.mockResolvedValue({
      id: 'custody-active-1',
      returnedAt: null,
    });

    await maintenanceService.update('org-1', 'maint-1', {
      status: MaintenanceStatus.COMPLETED,
    });

    expect(mockPrisma.asset.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'asset-1' },
        data: { status: AssetStatus.ACTIVE }, // Must be ACTIVE, NOT AVAILABLE!
      }),
    );
  });

  it('restores asset to AVAILABLE when maintenance is completed IF NO active custody exists', async () => {
    mockPrisma.maintenanceRequest.findFirst.mockResolvedValue({
      id: 'maint-1',
      organizationId: 'org-1',
      assetId: 'asset-1',
      status: MaintenanceStatus.IN_PROGRESS,
    });
    mockPrisma.maintenanceRequest.update.mockResolvedValue({
      id: 'maint-1',
      assetId: 'asset-1',
      status: MaintenanceStatus.COMPLETED,
    });
    // No active custody
    mockPrisma.custodyRecord.findFirst.mockResolvedValue(null);

    await maintenanceService.update('org-1', 'maint-1', {
      status: MaintenanceStatus.COMPLETED,
    });

    expect(mockPrisma.asset.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'asset-1' },
        data: { status: AssetStatus.AVAILABLE }, // Available in storage
      }),
    );
  });

  it('forces status to OPEN and strips technician/cost when EMPLOYEE creates maintenance', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ email: 'employee@org1.com' });
    mockPrisma.employee.findFirst.mockResolvedValue({ id: 'emp-1', name: 'Sara' });
    mockPrisma.maintenanceRequest.create.mockResolvedValue({
      id: 'maint-new-1',
      status: MaintenanceStatus.OPEN,
    });

    await maintenanceService.create(
      'org-1',
      'user-1',
      ['EMPLOYEE'],
      {
        issue: 'Broken screen',
        status: MaintenanceStatus.COMPLETED, // Rogue attempt by employee
        technician: 'Faris',
        cost: 500,
      },
    );

    expect(mockPrisma.maintenanceRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: MaintenanceStatus.OPEN, // Enforced to OPEN!
          technician: null, // Stripped!
          cost: null, // Stripped!
          requestedById: 'emp-1', // Automatically bound!
        }),
      }),
    );
  });
});
