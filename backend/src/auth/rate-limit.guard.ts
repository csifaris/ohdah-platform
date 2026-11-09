import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

export const RATE_LIMIT_KEY = 'rate_limit';
export type RateLimitOptions = { limit: number; ttlSeconds: number };

export const RateLimit = (limit: number, ttlSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, ttlSeconds });

type RateRecord = { count: number; expiresAt: number };

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateRecord>();

  constructor(private readonly reflector: Reflector) {
    // Periodic cleanup every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (record.expiresAt <= now) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.method}_${req.baseUrl || ''}${req.path}_${ip}`;
    const now = Date.now();

    const record = this.store.get(key);
    if (!record || record.expiresAt <= now) {
      this.store.set(key, {
        count: 1,
        expiresAt: now + options.ttlSeconds * 1000,
      });
      return true;
    }

    if (record.count >= options.limit) {
      const waitSeconds = Math.ceil((record.expiresAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `تم تجاوز الحد المسموح به من المحاولات. يرجى الانتظار ${waitSeconds} ثانية.`,
          retryAfter: waitSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}
