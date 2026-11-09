import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findMe(organizationId: string, email: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        organizationId,
        email: email.trim().toLowerCase(),
      },
      include: {
        department: true,
        custodyRecords: {
          where: { returnedAt: null },
          include: { asset: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('لم يتم العثور على ملف موظف مرتبط بحسابك في هذه المنشأة.');
    }

    return employee;
  }

  async findAll(organizationId: string, search?: string, departmentId?: string) {
    return this.prisma.employee.findMany({
      where: {
        organizationId,
        ...(departmentId ? { departmentId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { employeeNumber: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        department: true,
        custodyRecords: {
          where: { returnedAt: null },
          include: { asset: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId },
      include: {
        department: true,
        custodyRecords: {
          include: { asset: true, history: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود أو لا يتبع لهذه المنشأة.');
    }

    return employee;
  }

  async create(organizationId: string, dto: CreateEmployeeDto, actorId?: string) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.employee.findFirst({
      where: {
        organizationId,
        OR: [
          { employeeNumber: dto.employeeNumber.trim() },
          { email },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('الرقم الوظيفي أو البريد الإلكتروني مستخدم مسبقاً في هذه المنشأة.');
    }

    const employee = await this.prisma.employee.create({
      data: {
        organizationId,
        departmentId: dto.departmentId || null,
        employeeNumber: dto.employeeNumber.trim(),
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        jobTitle: dto.jobTitle?.trim() || null,
        status: dto.status || 'ACTIVE',
      },
      include: { department: true },
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'CREATE',
      resource: 'employee',
      resourceId: employee.id,
      metadata: { employeeNumber: employee.employeeNumber, name: employee.name },
    });

    return employee;
  }

  async update(organizationId: string, id: string, dto: UpdateEmployeeDto, actorId?: string) {
    const employee = await this.findOne(organizationId, id);

    if (dto.email && dto.email.trim().toLowerCase() !== employee.email) {
      const email = dto.email.trim().toLowerCase();
      const duplicate = await this.prisma.employee.findFirst({
        where: {
          organizationId,
          email,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new BadRequestException('البريد الإلكتروني مستخدم مسبقاً في هذه المنشأة.');
      }
    }

    const { departmentName, ...updateData } = dto;
    if (departmentName) {
      let dept = await this.prisma.department.findFirst({
        where: { organizationId, name: departmentName.trim() },
      });
      if (!dept) {
        dept = await this.prisma.department.create({
          data: { organizationId, name: departmentName.trim() },
        });
      }
      updateData.departmentId = dept.id;
    }

    const updated = await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        ...updateData,
        email: dto.email ? dto.email.trim().toLowerCase() : undefined,
        name: dto.name ? dto.name.trim() : undefined,
      },
      include: { department: true },
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'UPDATE',
      resource: 'employee',
      resourceId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId },
      include: {
        custodyRecords: {
          where: { returnedAt: null },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود أو لا يتبع لهذه المنشأة.');
    }

    if (employee.custodyRecords.length > 0) {
      throw new BadRequestException('لا يمكن حذف موظف لديه عهدة نشطة حالياً. يرجى إرجاع كافة العهد أولاً.');
    }

    await this.audit.record({
      organizationId,
      actorId,
      action: 'DELETE',
      resource: 'employee',
      resourceId: id,
      metadata: { employeeNumber: employee.employeeNumber, name: employee.name },
    });

    return this.prisma.employee.delete({ where: { id: employee.id } });
  }
}
