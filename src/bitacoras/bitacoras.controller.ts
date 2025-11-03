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
import { TenantGuard } from '../common/guards/tenant.guard';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { BitacorasService } from './bitacoras.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { UpdateBitacoraDto } from './dto/update-bitacora.dto';

@ApiTags('Bitácoras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'obras/:obraId/bitacoras',
  version: '1',
})
export class BitacorasController {
  constructor(private readonly bitacorasService: BitacorasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bitácora entry' })
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Request() req: any,
    @Body() createBitacoraDto: CreateBitacoraDto,
  ) {
    const usuarioId = req.user.id;
    return this.bitacorasService.create(obraId, usuarioId, createBitacoraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bitácoras for an obra' })
  findAll(@Param('obraId', ParseUUIDPipe) obraId: string) {
    return this.bitacorasService.findAllByObra(obraId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific bitácora by ID' })
  findOne(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bitacorasService.findOneByIdInObra(id, obraId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bitácora entry' })
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() updateBitacoraDto: UpdateBitacoraDto,
  ) {
    const usuarioId = req.user.id;
    return this.bitacorasService.updateInObra(
      id,
      obraId,
      usuarioId,
      updateBitacoraDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bitácora entry' })
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const usuarioId = req.user.id;
    return this.bitacorasService.deleteInObra(id, obraId, usuarioId);
  }
}
