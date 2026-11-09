import { PrismaClient, AssetStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const organizationId = '11111111-1111-4111-8111-111111111111';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ خطأ أمني: تشغيل سكريبت Seed محظور تماماً في بيئة الإنتاج (Production).');
    process.exit(1);
  }
  console.log('Seeding Ohdah Database...');

  // ==========================
  // 1. Organization
  // ==========================
  const organization = await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: 'شركة عُهدة التجريبية' },
    create: {
      id: organizationId,
      name: 'شركة عُهدة التجريبية',
      legalName: 'Ohdah Demo Organization',
    },
  });

  // ==========================
  // 2. Department
  // ==========================
  const department = await prisma.department.upsert({
    where: {
      organizationId_name: {
        organizationId,
        name: 'تقنية المعلومات',
      },
    },
    update: {},
    create: {
      organizationId,
      name: 'تقنية المعلومات',
      code: 'IT',
    },
  });

  // ==========================
  // 3. Permissions
  // ==========================
  const permissionNames = [
    ['assets', 'read'],
    ['assets', 'write'],
    ['custody', 'read'],
    ['custody', 'write'],
    ['maintenance', 'read'],
    ['maintenance', 'write'],
    ['reports', 'read'],
    ['users', 'manage'],
  ];

  const permissions = await Promise.all(
    permissionNames.map(([resource, action]) =>
      prisma.permission.upsert({
        where: {
          resource_action: { resource, action },
        },
        update: {},
        create: {
          resource,
          action,
          description: `${action} ${resource}`,
        },
      }),
    ),
  );

  // ==========================
  // 4. Roles
  // ==========================
  const adminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId, name: 'ADMIN' } },
    update: {},
    create: {
      organizationId,
      name: 'ADMIN',
      description: 'مسؤول النظام',
      isSystem: true,
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } },
    update: {},
    create: {
      organizationId,
      name: 'EMPLOYEE',
      description: 'موظف',
      isSystem: true,
    },
  });

  const assetManagerRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId, name: 'ASSET_MANAGER' } },
    update: {},
    create: {
      organizationId,
      name: 'ASSET_MANAGER',
      description: 'مسؤول العهد والأصول',
      isSystem: true,
    },
  });

  // Assign permissions to Admin and Asset Manager roles
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: assetManagerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: assetManagerRole.id,
        permissionId: permission.id,
      },
    });

    if (['custody', 'maintenance'].includes(permission.resource)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: employeeRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // ==========================
  // 5. Admin Account
  // ==========================
  const adminPassword = await bcrypt.hash('ChangeMe123!', 12);
  const admin = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId,
        email: 'admin@ohdah.local',
      },
    },
    update: {
      name: 'مدير النظام',
      status: 'ACTIVE',
      departmentId: department.id,
    },
    create: {
      organizationId,
      departmentId: department.id,
      email: 'admin@ohdah.local',
      passwordHash: adminPassword,
      name: 'مدير النظام',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  // ==========================
  // 6. Asset Manager Account
  // ==========================
  const managerPassword = await bcrypt.hash('ChangeMe123!', 12);
  const assetManager = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId,
        email: 'asset.manager@ohdah.local',
      },
    },
    update: {
      name: 'مسؤول العهد والأصول',
      status: 'ACTIVE',
      departmentId: department.id,
    },
    create: {
      organizationId,
      departmentId: department.id,
      email: 'asset.manager@ohdah.local',
      passwordHash: managerPassword,
      name: 'مسؤول العهد والأصول',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: assetManager.id, roleId: assetManagerRole.id } },
    update: {},
    create: { userId: assetManager.id, roleId: assetManagerRole.id },
  });

  // ==========================
  // 7. Asset Categories
  // ==========================
  const categoryNames = ['أجهزة حاسب', 'أجهزة مكتبية', 'أثاث مكتبي', 'المركبات والآليات'];
  const createdCategories: Record<string, string> = {};

  for (const [index, name] of categoryNames.entries()) {
    const cat = await prisma.assetCategory.upsert({
      where: {
        organizationId_name: { organizationId, name },
      },
      update: { code: `CAT-${index + 1}` },
      create: {
        organizationId,
        name,
        code: `CAT-${index + 1}`,
      },
    });
    createdCategories[name] = cat.id;
  }

  // ==========================
  // 8. Sample Assets
  // ==========================
  const sampleAssets = [
    {
      assetNumber: 'AST-1001',
      name: 'MacBook Pro M3 Max 16"',
      categoryName: 'أجهزة حاسب',
      serialNumber: 'C02G3390MD6R',
      location: 'مستودع الرياض الرئيسي',
      status: AssetStatus.AVAILABLE,
      description: 'جهاز حاسب محمول للمطورين',
    },
    {
      assetNumber: 'AST-1002',
      name: 'Dell XPS 15 9530',
      categoryName: 'أجهزة حاسب',
      serialNumber: 'DL-99882211',
      location: 'مستودع الرياض الرئيسي',
      status: AssetStatus.AVAILABLE,
      description: 'جهاز محمول للأعمال المكتبية',
    },
    {
      assetNumber: 'AST-1003',
      name: 'شاشة Dell UltraSharp 27" 4K',
      categoryName: 'أجهزة مكتبية',
      serialNumber: 'SN-DELL-4K-01',
      location: 'مبنى الإدارة - الدور 3',
      status: AssetStatus.AVAILABLE,
      description: 'شاشة احترافية للتصميم',
    },
  ];

  for (const item of sampleAssets) {
    const categoryId = createdCategories[item.categoryName] || Object.values(createdCategories)[0];
    await prisma.asset.upsert({
      where: {
        organizationId_assetNumber: {
          organizationId,
          assetNumber: item.assetNumber,
        },
      },
      update: {
        name: item.name,
        status: item.status,
        location: item.location,
      },
      create: {
        organizationId,
        categoryId,
        assetNumber: item.assetNumber,
        name: item.name,
        serialNumber: item.serialNumber,
        status: item.status,
        location: item.location,
        description: item.description,
      },
    });
  }

  // ==========================
  // 9. Employees & User Accounts
  // ==========================
  const employeesData = [
    { name: 'أحمد محمد', email: 'employee1@ohdah.local', phone: '0501112233', jobTitle: 'مهندس برمجيات' },
    { name: 'سارة عبدالله', email: 'employee2@ohdah.local', phone: '0502223344', jobTitle: 'محللة نظم' },
    { name: 'خالد علي', email: 'employee3@ohdah.local', phone: '0503334455', jobTitle: 'أخصائي شبكات' },
  ];

  const employeePassword = await bcrypt.hash('employee123', 12);
  let firstEmp: any = null;

  for (const [index, emp] of employeesData.entries()) {
    const employee = await prisma.employee.upsert({
      where: {
        organizationId_employeeNumber: {
          organizationId,
          employeeNumber: `EMP-${index + 1}`,
        },
      },
      update: {
        name: emp.name,
        email: emp.email,
      },
      create: {
        organizationId,
        departmentId: department.id,
        employeeNumber: `EMP-${index + 1}`,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        jobTitle: emp.jobTitle,
        status: 'ACTIVE',
      },
    });

    if (!firstEmp) firstEmp = employee;

    const empUser = await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email: emp.email,
        },
      },
      update: {
        name: emp.name,
        status: 'ACTIVE',
      },
      create: {
        organizationId,
        departmentId: department.id,
        email: emp.email,
        passwordHash: employeePassword,
        name: emp.name,
        status: 'ACTIVE',
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: empUser.id, roleId: employeeRole.id } },
      update: {},
      create: { userId: empUser.id, roleId: employeeRole.id },
    });
  }

  // ==========================
  // 10. Sample Pending Request
  // ==========================
  if (firstEmp) {
    const existingReq = await prisma.custodyRequest.findFirst({
      where: { requesterId: firstEmp.id },
    });
    if (!existingReq) {
      await prisma.custodyRequest.create({
        data: {
          organizationId,
          requesterId: firstEmp.id,
          category: 'أجهزة حاسب',
          reason: 'حاجة العمل لمشروع التطوير الجديد',
          priority: 'HIGH',
          status: 'PENDING',
        },
      });
    }
  }

  console.log(`
================================
✅ Seed Completed Successfully!

🏢 Organization: ${organization.name}

🔑 Admin:
   Email: admin@ohdah.local
   Password: ChangeMe123!

🔑 Asset Manager:
   Email: asset.manager@ohdah.local
   Password: ChangeMe123!

🔑 Employee:
   Email: employee1@ohdah.local
   Password: employee123
================================
`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
