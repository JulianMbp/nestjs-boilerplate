import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from './infrastructure/persistence/relational/entities/activity-log.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepository: Repository<ActivityLogEntity>,
  ) {}

  async create(data: {
    user_id: string;
    obra_id?: string | null;
    action: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<ActivityLogEntity> {
    const log = this.activityLogRepository.create({
      user_id: data.user_id,
      obra_id: data.obra_id || undefined,
      action: data.action,
      description: data.description,
      metadata: data.metadata || {},
    });
    return this.activityLogRepository.save(log);
  }

  async findAll(): Promise<ActivityLogEntity[]> {
    return this.activityLogRepository.find({
      order: { created_at: 'DESC' },
      relations: ['user', 'obra'],
      take: 100,
    });
  }

  async findByUser(userId: string): Promise<ActivityLogEntity[]> {
    return this.activityLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      relations: ['obra'],
      take: 100,
    });
  }

  async findByObra(obraId: string): Promise<ActivityLogEntity[]> {
    return this.activityLogRepository.find({
      where: { obra_id: obraId },
      order: { created_at: 'DESC' },
      relations: ['user'],
      take: 100,
    });
  }
}
