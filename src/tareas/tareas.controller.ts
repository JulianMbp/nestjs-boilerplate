import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { TareasService } from './tareas.service';

@ApiTags('Tareas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'obras/:obraId/tareas',
  version: '1',
})
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new task' })
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Request() req: any,
    @Body() createTareaDto: CreateTareaDto,
  ) {
    const usuarioId = req.user.id;
    return this.tareasService.create(obraId, usuarioId, createTareaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for an obra' })
  findAll(@Param('obraId', ParseUUIDPipe) obraId: string) {
    return this.tareasService.findAllByObra(obraId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  findOne(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tareasService.findOneByIdInObra(id, obraId);
  }

  @Patch(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTareaDto: UpdateTareaDto,
  ) {
    return this.tareasService.updateInObra(id, obraId, updateTareaDto);
  }

  @Delete(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a task' })
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tareasService.deleteInObra(id, obraId);
  }
}
