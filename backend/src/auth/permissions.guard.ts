import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate { constructor(private readonly reflector: Reflector) {} canActivate(context: ExecutionContext) { const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]); if (!required?.length) return true; const request = context.switchToHttp().getRequest<{ user?: { permissions?: string[]; roles?: string[] } }>(); const permissions = request.user?.permissions || []; const isAdmin = (request.user?.roles || []).some((role) => ['ADMIN', 'SUPER_ADMIN', 'مدير النظام'].includes(role)); if (isAdmin || required.every((permission) => permissions.includes(permission))) return true; throw new ForbiddenException('لا تملك الصلاحية المطلوبة لتنفيذ هذا الإجراء'); } }
