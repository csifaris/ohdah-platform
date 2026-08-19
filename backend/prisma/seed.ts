import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const organizationId = '11111111-1111-4111-8111-111111111111';
const adminId = '22222222-2222-4222-8222-222222222222';

async function main() {
  const organization = await prisma.organization.upsert({ where: { id: organizationId }, update: { name: 'شركة عُهدة التجريبية' }, create: { id: organizationId, name: 'شركة عُهدة التجريبية', legalName: 'Ohdah Demo Organization' } });
  const department = await prisma.department.upsert({ where: { organizationId_name: { organizationId, name: 'تقنية المعلومات' } }, update: {}, create: { organizationId, name: 'تقنية المعلومات', code: 'IT' } });
  const permissionNames = [['assets', 'read'], ['assets', 'write'], ['custody', 'read'], ['custody', 'write'], ['maintenance', 'read'], ['maintenance', 'write'], ['reports', 'read'], ['users', 'manage']];
  const permissions = await Promise.all(permissionNames.map(([resource, action]) => prisma.permission.upsert({ where: { resource_action: { resource, action } }, update: {}, create: { resource, action, description: `${action} ${resource}` } })));
  const adminRole = await prisma.role.upsert({ where: { organizationId_name: { organizationId, name: 'ADMIN' } }, update: {}, create: { organizationId, name: 'ADMIN', description: 'مسؤول النظام', isSystem: true } });
  const employeeRole = await prisma.role.upsert({ where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } }, update: {}, create: { organizationId, name: 'EMPLOYEE', description: 'مستخدم موظف', isSystem: true } });
  await Promise.all(permissions.map((permission) => prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } }, update: {}, create: { roleId: adminRole.id, permissionId: permission.id } })));
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  const admin = await prisma.user.upsert({ where: { organizationId_email: { organizationId, email: 'admin@ohdah.local' } }, update: { name: 'مدير النظام', passwordHash, status: 'ACTIVE', departmentId: department.id }, create: { id: adminId, organizationId, departmentId: department.id, email: 'admin@ohdah.local', passwordHash, name: 'مدير النظام', status: 'ACTIVE' } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } });
  void employeeRole;
  for (const [index, name] of ['أجهزة حاسب', 'أجهزة مكتبية', 'أثاث مكتبي', 'المركبات والآليات'].entries()) await prisma.assetCategory.upsert({ where: { organizationId_name: { organizationId, name } }, update: { code: `CAT-${index + 1}` }, create: { organizationId, name, code: `CAT-${index + 1}` } });
  for (const [index, name] of ['أحمد محمد', 'سارة عبدالله', 'خالد علي'].entries()) await prisma.employee.upsert({ where: { organizationId_employeeNumber: { organizationId, employeeNumber: `EMP-${index + 1}` } }, update: { name }, create: { organizationId, departmentId: department.id, employeeNumber: `EMP-${index + 1}`, name, email: `employee${index + 1}@ohdah.local`, jobTitle: 'موظف', status: 'ACTIVE' } });
  console.log(`Seeded ${organization.name}; default roles ADMIN and EMPLOYEE are ready.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
