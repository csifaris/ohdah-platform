import { ExecutionContext, ForbiddenException, HttpException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { RolesGuard } from '../src/auth/roles.guard';
import { PermissionsGuard } from '../src/auth/permissions.guard';
import { RateLimitGuard } from '../src/auth/rate-limit.guard';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication & Authorization Security Tests', () => {
  describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let mockPrisma: Partial<PrismaService>;
    let mockConfig: Partial<ConfigService>;

    beforeEach(() => {
      mockPrisma = {
        user: {
          findUnique: jest.fn(),
        } as any,
      };
      mockConfig = {
        getOrThrow: jest.fn().mockReturnValue('test-secret-key-12345'),
      };
      strategy = new JwtStrategy(mockConfig as ConfigService, mockPrisma as PrismaService);
    });

    it('rejects validation when user does not exist in database', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-1',
          tokenVersion: 0,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects validation when user account is SUSPENDED or INACTIVE', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@domain.com',
        status: 'SUSPENDED',
        organizationId: 'org-1',
        tokenVersion: 0,
        roles: [],
      });

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-1',
          tokenVersion: 0,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects validation when token organizationId does not match database user organizationId', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@domain.com',
        status: 'ACTIVE',
        organizationId: 'org-ACTUAL',
        tokenVersion: 0,
        roles: [],
      });

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-ATTACKER-FORGED',
          tokenVersion: 0,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('successfully authorizes an ACTIVE user and returns fresh roles and permissions', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@domain.com',
        name: 'Test User',
        status: 'ACTIVE',
        organizationId: 'org-1',
        tokenVersion: 0,
        roles: [
          {
            role: {
              name: 'ADMIN',
              permissions: [
                { permission: { resource: 'assets', action: 'read' } },
                { permission: { resource: 'assets', action: 'write' } },
              ],
            },
          },
        ],
      });

      const result = await strategy.validate({
        sub: 'user-1',
        email: 'test@domain.com',
        organizationId: 'org-1',
        tokenVersion: 0,
      });

      expect(result).toBeDefined();
      expect(result.sub).toBe('user-1');
      expect(result.roles).toContain('ADMIN');
      expect(result.permissions).toContain('assets:read');
      expect(result.permissions).toContain('assets:write');
    });

    it('rejects validation when tokenVersion in payload does not match user tokenVersion in database', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@domain.com',
        status: 'ACTIVE',
        organizationId: 'org-1',
        tokenVersion: 3,
        roles: [],
      });

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-1',
          tokenVersion: 2, // Invalidation triggered (older version)
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('strictly rejects legacy tokens without tokenVersion under the strict security policy', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@domain.com',
        status: 'ACTIVE',
        organizationId: 'org-1',
        tokenVersion: 0,
        roles: [],
      });

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-1',
          // tokenVersion omitted
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('strictly rejects tokens with negative or non-integer tokenVersion', async () => {
      (mockPrisma.user!.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@domain.com',
        status: 'ACTIVE',
        organizationId: 'org-1',
        tokenVersion: 0,
        roles: [],
      });

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-1',
          tokenVersion: -1 as any,
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@domain.com',
          organizationId: 'org-1',
          tokenVersion: 1.5 as any,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    function createMockContext(roles: string[]): ExecutionContext {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { roles },
          }),
        }),
      } as unknown as ExecutionContext;
    }

    it('allows access when no roles are required on route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const ctx = createMockContext(['EMPLOYEE']);
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('blocks regular EMPLOYEE from accessing ADMIN routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'ASSET_MANAGER']);
      const ctx = createMockContext(['EMPLOYEE']);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('allows ASSET_MANAGER access to manager routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'ASSET_MANAGER']);
      const ctx = createMockContext(['ASSET_MANAGER']);
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows ADMIN access to manager routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'ASSET_MANAGER']);
      const ctx = createMockContext(['ADMIN']);
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new PermissionsGuard(reflector);
    });

    function createMockContext(user: { roles?: string[]; permissions?: string[] }): ExecutionContext {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      } as unknown as ExecutionContext;
    }

    it('allows access when no permissions are required on route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const ctx = createMockContext({ permissions: [] });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('blocks user lacking required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['assets:delete']);
      const ctx = createMockContext({ permissions: ['assets:read'] });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('allows user with all required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['assets:read', 'assets:write']);
      const ctx = createMockContext({ permissions: ['assets:read', 'assets:write'] });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows ADMIN even if permissions array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['assets:delete']);
      const ctx = createMockContext({ roles: ['ADMIN'], permissions: [] });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('RateLimitGuard', () => {
    let guard: RateLimitGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RateLimitGuard(reflector);
    });

    function createMockContext(ip: string): ExecutionContext {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            path: '/auth/login',
            ip,
          }),
        }),
      } as unknown as ExecutionContext;
    }

    it('throttles excessive requests beyond the configured limit', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ limit: 3, ttlSeconds: 60 });
      const ctx = createMockContext('192.168.1.100');

      expect(guard.canActivate(ctx)).toBe(true);
      expect(guard.canActivate(ctx)).toBe(true);
      expect(guard.canActivate(ctx)).toBe(true);

      // 4th request must be rejected
      expect(() => guard.canActivate(ctx)).toThrow(HttpException);
    });
  });

  describe('AuthService Refresh Tokens & Session Revocation', () => {
    let authService: AuthService;
    let mockPrisma: any;
    let mockJwt: Partial<JwtService>;
    let mockConfig: Partial<ConfigService>;

    beforeEach(() => {
      mockPrisma = {
        refreshToken: {
          findFirst: jest.fn(),
          update: jest.fn(),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          create: jest.fn(),
        },
        user: {
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn().mockResolvedValue({ id: 'usr-1', tokenVersion: 1 }),
        },
        $transaction: jest.fn((cb) => cb(mockPrisma)),
      };
      mockJwt = {
        signAsync: jest.fn().mockResolvedValue('mock-access-token-new'),
      };
      mockConfig = {
        get: jest.fn().mockReturnValue('7d'),
      };
      authService = new AuthService(
        mockPrisma as PrismaService,
        mockJwt as JwtService,
        mockConfig as ConfigService,
      );
    });

    it('rejects invalid or missing refresh token', async () => {
      await expect(authService.refresh('')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects expired refresh token', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'tok-1',
        userId: 'usr-1',
        tokenHash: 'somehash',
        expiresAt: new Date(Date.now() - 10000), // Expired
        revokedAt: null,
      });

      await expect(authService.refresh('some-raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('triggers reuse detection, increments tokenVersion and revokes all active sessions when revoked token is used outside grace period', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'tok-1',
        userId: 'usr-1',
        tokenHash: 'somehash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: new Date(Date.now() - 60000), // Revoked 1 minute ago (outside 15s grace)
      });

      await expect(authService.refresh('some-replayed-token')).rejects.toThrow(
        UnauthorizedException,
      );

      // Verify that all active refresh tokens for the user were revoked
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });

      // Verify tokenVersion incremented to immediately invalidate existing access tokens
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { tokenVersion: { increment: 1 } },
      });
    });

    it('rejects concurrent request within 15-second grace period with 409 CONCURRENT_REFRESH without revoking all sessions', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'tok-1',
        userId: 'usr-1',
        tokenHash: 'somehash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: new Date(Date.now() - 5000), // Revoked 5 seconds ago (inside 15s grace)
      });

      try {
        await authService.refresh('some-replayed-token');
        fail('Should have thrown HttpException');
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(409);
        const res = err.getResponse();
        expect(res.code).toBe('CONCURRENT_REFRESH');
      }

      // Must NOT nuke all user sessions or increment tokenVersion during grace window
      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'usr-1' }),
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects concurrent refresh race if conditional update returns count === 0 and avoids creating duplicate token', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'tok-racing',
        userId: 'usr-1',
        tokenHash: 'validhash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        user: {
          id: 'usr-1',
          email: 'user@domain.com',
          name: 'Valid User',
          organizationId: 'org-1',
          status: 'ACTIVE',
          tokenVersion: 0,
          roles: [],
        },
      });

      // Simulate that another concurrent transaction updated this row in the exact same millisecond
      mockPrisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 0 });

      try {
        await authService.refresh('token-racing');
        fail('Should have thrown HttpException 409');
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(409);
        expect(err.getResponse().code).toBe('CONCURRENT_REFRESH');
      }

      // Critical: Ensure no successor token was created by the losing transaction
      expect(mockPrisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('successfully rotates refresh token with atomic conditional check and returns new pair for active user', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'tok-valid',
        userId: 'usr-1',
        tokenHash: 'validhash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        user: {
          id: 'usr-1',
          email: 'user@domain.com',
          name: 'Valid User',
          organizationId: 'org-1',
          status: 'ACTIVE',
          tokenVersion: 0,
          roles: [{ role: { name: 'EMPLOYEE', permissions: [] } }],
        },
      });

      mockPrisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await authService.refresh('valid-token-string');

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token-new');
      expect(result.refreshToken).toBeDefined();

      // Verify current token was conditionally revoked with revokedAt: null guard
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'tok-valid', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });

      // Verify new successor token was created
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();

      // Verify tokenVersion was included in the new access token payload
      expect(mockJwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ tokenVersion: 0 }),
      );
    });

    it('bubbles database failure and does not claim penalty was saved if database fails during replay detection', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'tok-1',
        userId: 'usr-1',
        tokenHash: 'somehash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: new Date(Date.now() - 60000), // Outside grace period
      });

      // Simulate database failure during tokenVersion update
      mockPrisma.user.update.mockRejectedValueOnce(new Error('PostgreSQL connection dropped'));

      await expect(authService.refresh('some-replayed-token')).rejects.toThrow(
        'PostgreSQL connection dropped',
      );
    });

    it('logout revokes only the specific device session and does not increment tokenVersion', async () => {
      await authService.logout('usr-1', 'specific-device-token');

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'usr-1',
          tokenHash: expect.any(String),
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });

      // Crucial: tokenVersion must NOT be incremented on single-device logout
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('logoutAll revokes all user sessions and increments tokenVersion for emergency revocation', async () => {
      await authService.logoutAll('usr-1');

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { tokenVersion: { increment: 1 } },
      });
    });
  });
});
