import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatObraDto } from '../ai/dto/chat-obra.dto';
import { GenerarBitacoraAiDto } from '../ai/dto/generar-bitacora-ai.dto';
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
  @ApiOperation({
    summary: 'Get all bitácoras for an obra',
    description:
      'Obtiene todas las bitácoras de una obra. Puede filtrar por tipo usando el query parameter generada_por_ia (true para IA, false para manuales)',
  })
  findAll(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Query('generada_por_ia') generadaPorIa?: string,
  ) {
    const filtroIa =
      generadaPorIa !== undefined ? generadaPorIa === 'true' : undefined;
    return this.bitacorasService.findAllByObra(obraId, filtroIa);
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

  @Post('generar-informe-ia')
  @ApiOperation({
    summary: 'Generar informe de bitácora usando IA',
    description:
      'Genera un informe HTML de bitácora usando IA y lo guarda automáticamente en la base de datos. El informe incluye información de la obra, materiales, tareas recientes y bitácoras anteriores. Devuelve el HTML en formato JSON para que el frontend pueda generar el PDF, junto con la bitácora guardada.',
  })
  async generarInformeIA(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Request() req: any,
    @Body() dto: GenerarBitacoraAiDto,
  ) {
    const usuarioId = req.user.id;
    const resultado = await this.bitacorasService.generarInformeConIA(
      obraId,
      usuarioId,
      dto,
    );

    // Retornar en formato JSON con el HTML en data y la bitácora guardada
    return {
      success: true,
      data: {
        html: resultado.html,
        tokensUsados: resultado.tokensUsados,
        bitacora: resultado.bitacora,
      },
      message: 'Informe generado y guardado exitosamente',
    };
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Chat con IA sobre la obra',
    description:
      'Haz preguntas sobre la obra y recibe respuestas basadas en la información disponible (materiales, tareas, bitácoras, etc.). La IA responde como un experto que conoce la obra.',
  })
  async chatObra(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Body() dto: ChatObraDto,
  ) {
    const resultado = await this.bitacorasService.responderPreguntaObra(
      obraId,
      dto.mensaje,
    );

    // Retornar en formato JSON con la respuesta
    return {
      success: true,
      data: {
        respuesta: resultado.respuesta,
        tokensUsados: resultado.tokensUsados,
      },
      message: 'Respuesta generada exitosamente',
    };
  }
}
