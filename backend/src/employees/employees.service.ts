import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateEmployeeDto) { return this.prisma.employee.create({ data: dto }); }
  findAll(organizationId: string, search?: string, departmentId?: string) { return this.prisma.employee.findMany({ where: { organizationId, departmentId, ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { employeeNumber: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {}) }, include: { department: true, custodyRecords: { where: { returnedAt: null }, include: { asset: true } } }, orderBy: { name: 'asc' } }); }
  async findOne(id: string) { const employee = await this.prisma.employee.findUnique({ where: { id }, include: { department: true, custodyRecords: { include: { asset: true, history: true }, orderBy: { createdAt: 'desc' } } } }); if (!employee) throw new NotFoundException('Employee not found'); return employee; }
  async update(id: string, dto: UpdateEmployeeDto) { 
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    
    if (dto.email && dto.email !== employee.email) {
      // Find the corresponding user
      const user = await this.prisma.user.findFirst({
        where: { organizationId: employee.organizationId, email: employee.email }
      });
      if (user) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { email: dto.email }
        });
      }
    }
    
    const { departmentName, ...updateData } = dto;
    if (departmentName) {
      // Create or find department
      let dept = await this.prisma.department.findFirst({
        where: { organizationId: employee.organizationId, name: departmentName }
      });
      if (!dept) {
        dept = await this.prisma.department.create({
          data: { organizationId: employee.organizationId, name: departmentName }
        });
      }
      updateData.departmentId = dept.id;
    }
    
    return this.prisma.employee.update({ where: { id }, data: updateData });
  }
  async remove(id: string) { await this.ensureExists(id); return this.prisma.employee.delete({ where: { id } }); }
  private async ensureExists(id: string) { if (!(await this.prisma.employee.findUnique({ where: { id }, select: { id: true } }))) throw new NotFoundException('Employee not found'); }
}
