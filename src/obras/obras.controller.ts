import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { Obra } from './domain/obra';
import { AsignarUsuarioObraDto } from './dto/asignar-usuario-obra.dto';
import { CreateObraDto } from './dto/create-obra.dto';
import { UpdateObraDto } from './dto/update-obra.dto';
import { ObrasService } from './obras.service';

@ApiTags('Obras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'obras',
  version: '1',
})
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  @Post()
  @Roles('admin_general', 'admin_obra')
  @ApiCreatedResponse({
    type: Obra,
  })
  create(@Body() createObraDto: CreateObraDto) {
    return this.obrasService.create(createObraDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.obrasService.findAll({
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Obra,
  })
  findOne(@Param('id') id: string) {
    return this.obrasService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin_general', 'admin_obra')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Obra,
  })
  update(@Param('id') id: string, @Body() updateObraDto: UpdateObraDto) {
    return this.obrasService.update(id, updateObraDto);
  }

  @Delete(':id')
  @Roles('admin_general')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.obrasService.remove(id);
  }

  @Post('asignar-usuario')
  @Roles('admin_general', 'admin_obra')
  @ApiCreatedResponse({
    description: 'Usuario asignado a la obra correctamente',
  })
  asignarUsuario(@Body() asignarDto: AsignarUsuarioObraDto) {
    return this.obrasService.asignarUsuarioObra(
      asignarDto.userId,
      asignarDto.obraId,
      asignarDto.roleId,
    );
  }

  @Get(':id/usuarios')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Lista de usuarios asignados a la obra',
  })
  obtenerUsuarios(@Param('id') id: string) {
    return this.obrasService.obtenerUsuariosObra(id);
  }
}
