import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import {
  PresupuestosService,
  PresupuestoWithTotal,
} from './presupuestos.service';

@ApiTags('Presupuestos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'obras/:obraId/presupuestos',
  version: '1',
})
export class PresupuestosController {
  constructor(private readonly presupuestosService: PresupuestosService) {}

  @Post()
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new budget item' })
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Body() createPresupuestoDto: CreatePresupuestoDto,
  ): Promise<PresupuestoWithTotal> {
    return this.presupuestosService.create(obraId, createPresupuestoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budget items for an obra' })
  findAll(
    @Param('obraId', ParseUUIDPipe) obraId: string,
  ): Promise<PresupuestoWithTotal[]> {
    return this.presupuestosService.findAllByObra(obraId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific budget item by ID' })
  findOne(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PresupuestoWithTotal> {
    return this.presupuestosService.findOneByIdInObra(id, obraId);
  }

  @Patch(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a budget item' })
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePresupuestoDto: UpdatePresupuestoDto,
  ): Promise<PresupuestoWithTotal> {
    return this.presupuestosService.updateInObra(
      id,
      obraId,
      updatePresupuestoDto,
    );
  }

  @Delete(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a budget item' })
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.presupuestosService.deleteInObra(id, obraId);
  }
}
