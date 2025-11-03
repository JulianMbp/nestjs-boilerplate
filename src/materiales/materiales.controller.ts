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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialesService } from './materiales.service';

@ApiTags('Materiales')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'obras/:obraId/materiales',
  version: '1',
})
export class MaterialesController {
  constructor(private readonly materialesService: MaterialesService) {}

  @Post()
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Body() createMaterialDto: CreateMaterialDto,
  ) {
    return this.materialesService.create(obraId, createMaterialDto);
  }

  @Get()
  findAll(@Param('obraId', ParseUUIDPipe) obraId: string) {
    return this.materialesService.findAllByObra(obraId);
  }

  @Get(':id')
  findOne(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.materialesService.findOneByIdInObra(id, obraId);
  }

  @Patch(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialesService.updateInObra(id, obraId, updateMaterialDto);
  }

  @Delete(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.materialesService.deleteInObra(id, obraId);
  }
}
