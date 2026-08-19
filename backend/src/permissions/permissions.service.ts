import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService { constructor(private readonly prisma: PrismaService) {} findAll() { return this.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] }); } findMatrix() { return this.prisma.permission.findMany({ include: { roles: { include: { role: true } } }, orderBy: [{ resource: 'asc' }, { action: 'asc' }] }); } }
