import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from '../../activity-logs/infrastructure/persistence/relational/entities/activity-log.entity';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepository: Repository<ActivityLogEntity>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    // Only log if user is authenticated
    if (!user || !user.id) {
      return next.handle();
    }

    const action = `${method} ${url}`;
    const obraId = request.obraId || request.params?.obraId || null;

    return next.handle().pipe(
      tap({
        next: async () => {
          try {
            await this.activityLogRepository.save({
              user_id: user.id,
              obra_id: obraId,
              action,
              description: `User performed ${method} on ${url}`,
              metadata: {
                method,
                url,
                params: request.params,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            // Log error but don't fail the request
            console.error('Failed to save activity log:', error);
          }
        },
        error: async (error) => {
          try {
            await this.activityLogRepository.save({
              user_id: user.id,
              obra_id: obraId,
              action,
              description: `User attempted ${method} on ${url} but failed`,
              metadata: {
                method,
                url,
                params: request.params,
                error: error.message,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (logError) {
            console.error('Failed to save error activity log:', logError);
          }
        },
      }),
    );
  }
}
