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
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';

@ApiTags('Asistencias')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'obras/:obraId/asistencias',
  version: '1',
})
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post()
  @Roles('Admin General', 'Admin Obra', 'RRHH')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new attendance record' })
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Request() req: any,
    @Body() createAsistenciaDto: CreateAsistenciaDto,
  ) {
    const usuarioId = req.user.id;
    return this.asistenciasService.create(
      obraId,
      usuarioId,
      createAsistenciaDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records for an obra' })
  findAll(@Param('obraId', ParseUUIDPipe) obraId: string) {
    return this.asistenciasService.findAllByObra(obraId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific attendance record by ID' })
  findOne(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.asistenciasService.findOneByIdInObra(id, obraId);
  }

  @Patch(':id')
  @Roles('Admin General', 'Admin Obra', 'RRHH')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update an attendance record' })
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.updateInObra(
      id,
      obraId,
      updateAsistenciaDto,
    );
  }

  @Delete(':id')
  @Roles('Admin General', 'Admin Obra', 'RRHH')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete an attendance record' })
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.asistenciasService.deleteInObra(id, obraId);
  }
}
