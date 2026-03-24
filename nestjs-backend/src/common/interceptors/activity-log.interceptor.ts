import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { ActivityType } from '../../activity-logs/activity-log.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private activityLogsService: ActivityLogsService,
    private jwtService: JwtService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, headers } = request;

    // Sadece belirli endpoint'leri logla
    if (!this.shouldLog(method, url)) {
      return next.handle();
    }

    const activityType = this.getActivityType(method);
    const module = this.getModule(url);

    return next.handle().pipe(
      tap(() => {
        // Async işlemi promise olarak başlat, await bekleme
        (async () => {
          try {
            let userId: string | null = null;
            let userEmail: string | null = null;

            // Önce request.user'dan al
            if (user && (user.userId || user.sub || user._id || user.id)) {
              userId = user.userId || user.sub || user._id || user.id;
              userEmail = user.email || 'unknown';
            } else {
              // JWT token'dan al
              const authHeader = headers.authorization;
              if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                  const decoded = this.jwtService.decode(token) as any;
                  if (decoded) {
                    userId = decoded.sub || decoded.userId || decoded.id;
                    userEmail = decoded.email || 'unknown';
                  }
                } catch (err) {
                  console.error('JWT decode error:', err);
                }
              }
            }

          if (userId) {
            const description = this.generateDescription(method, url, { email: userEmail });
            const ipAddress = request.ip || request.headers['x-forwarded-for'] as string || 'unknown';
            const userAgent = request.headers['user-agent'] || 'unknown';
            
            await this.activityLogsService.log(
              userId,
              activityType,
              description,
              module,
              undefined,
              { method, url, ipAddress, userAgent }
            );
            console.log(`Activity log saved: ${description}`);
          } else {
            console.log('No user ID found for activity log');
          }
          } catch (err) {
            console.error('Activity log error:', err);
          }
        })();
      }),
    );
  }

  private shouldLog(method: string, url: string): boolean {
    // GET isteklerini loglama (çok fazla olur)
    if (method === 'GET') return false;
    
    // Health check ve static dosyaları loglama
    if (url.includes('health') || url.includes('static')) return false;
    
    // Auth endpoint'lerini loglama (login/logout manuel loglanıyor)
    if (url.includes('/auth/login') || url.includes('/auth/logout')) return false;
    
    return true;
  }

  private getActivityType(method: string): ActivityType {
    const typeMap = {
      'POST': ActivityType.CREATE,
      'PUT': ActivityType.UPDATE,
      'PATCH': ActivityType.UPDATE,
      'DELETE': ActivityType.DELETE,
    };
    return typeMap[method] || ActivityType.CREATE;
  }

  private getModule(url: string): string {
    const parts = url.split('/').filter(p => p);
    return parts[0] || 'unknown';
  }

  private generateDescription(method: string, url: string, user: any): string {
    const action = {
      'POST': 'oluşturdu',
      'PUT': 'güncelledi',
      'PATCH': 'güncelledi',
      'DELETE': 'sildi',
    }[method] || 'işlem yaptı';

    const module = this.getModule(url);
    const email = user?.email || 'unknown';
    return `${email} - ${module} modülünde ${action}`;
  }
}

