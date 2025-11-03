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
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@ApiTags('Documentos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller({
  path: 'obras/:obraId/documentos',
  version: '1',
})
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new document' })
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Request() req: any,
    @Body() createDocumentoDto: CreateDocumentoDto,
  ) {
    const usuarioId = req.user.id;
    return this.documentosService.create(obraId, usuarioId, createDocumentoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for an obra' })
  findAll(@Param('obraId', ParseUUIDPipe) obraId: string) {
    return this.documentosService.findAllByObra(obraId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific document by ID' })
  findOne(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentosService.findOneByIdInObra(id, obraId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    return this.documentosService.updateInObra(id, obraId, updateDocumentoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentosService.deleteInObra(id, obraId);
  }
}
