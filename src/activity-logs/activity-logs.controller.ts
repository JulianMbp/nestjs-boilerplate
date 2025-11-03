import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { ActivityLogsService } from './activity-logs.service';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'logs',
  version: '1',
})
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles('Admin General')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all activity logs (Admin General only)' })
  findAll() {
    return this.activityLogsService.findAll();
  }
}
