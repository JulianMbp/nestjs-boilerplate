import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { GenerarBitacoraAiDto } from '../ai/dto/generar-bitacora-ai.dto';
import { MaterialesService } from '../materiales/materiales.service';
import { ObrasService } from '../obras/obras.service';
import { TareasService } from '../tareas/tareas.service';
import { UsersService } from '../users/users.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { UpdateBitacoraDto } from './dto/update-bitacora.dto';
import { BitacoraEntity } from './infrastructure/persistence/relational/entities/bitacora.entity';

@Injectable()
export class BitacorasService {
  constructor(
    @InjectRepository(BitacoraEntity)
    private readonly bitacoraRepository: Repository<BitacoraEntity>,
    private readonly aiService: AiService,
    private readonly obrasService: ObrasService,
    private readonly materialesService: MaterialesService,
    private readonly tareasService: TareasService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    obraId: string,
    usuarioId: number,
    createBitacoraDto: CreateBitacoraDto,
  ): Promise<BitacoraEntity> {
    const bitacora = this.bitacoraRepository.create({
      ...createBitacoraDto,
      obra_id: obraId,
      usuario_id: usuarioId,
      generada_por_ia: false, // Las bitácoras creadas manualmente no son generadas por IA
    });
    return this.bitacoraRepository.save(bitacora);
  }

  async findAllByObra(
    obraId: string,
    generadaPorIa?: boolean,
  ): Promise<BitacoraEntity[]> {
    const where: any = { obra_id: obraId };
    if (generadaPorIa !== undefined) {
      where.generada_por_ia = generadaPorIa;
    }

    return this.bitacoraRepository.find({
      where,
      order: { fecha: 'DESC', created_at: 'DESC' },
      relations: ['usuario'],
    });
  }

  async findOneByIdInObra(id: string, obraId: string): Promise<BitacoraEntity> {
    const bitacora = await this.bitacoraRepository.findOne({
      where: { id, obra_id: obraId },
      relations: ['usuario'],
    });

    if (!bitacora) {
      throw new NotFoundException('Bitácora not found in this obra');
    }

    return bitacora;
  }

  async updateInObra(
    id: string,
    obraId: string,
    usuarioId: number,
    updateBitacoraDto: UpdateBitacoraDto,
  ): Promise<BitacoraEntity> {
    const bitacora = await this.findOneByIdInObra(id, obraId);

    // Only the author can update their own bitacora
    if (bitacora.usuario_id !== usuarioId) {
      throw new UnauthorizedException('You can only update your own bitácoras');
    }

    Object.assign(bitacora, updateBitacoraDto);
    return this.bitacoraRepository.save(bitacora);
  }

  async deleteInObra(
    id: string,
    obraId: string,
    usuarioId: number,
  ): Promise<void> {
    const bitacora = await this.findOneByIdInObra(id, obraId);

    // Only the author can delete their own bitacora
    if (bitacora.usuario_id !== usuarioId) {
      throw new UnauthorizedException('You can only delete your own bitácoras');
    }

    await this.bitacoraRepository.remove(bitacora);
  }

  async generarInformeConIA(
    obraId: string,
    usuarioId: number,
    dto: GenerarBitacoraAiDto,
  ): Promise<{ html: string; tokensUsados?: number; bitacora?: BitacoraEntity }> {
    // 1. Obtener información de la obra
    const obra = await this.obrasService.findOne(obraId);
    if (!obra) {
      throw new NotFoundException(`Obra con ID ${obraId} no encontrada`);
    }

    // 2. Obtener información del usuario
    const usuario = await this.usersService.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // 3. Obtener materiales de la obra
    const materiales = await this.materialesService.findAllByObra(obraId);

    // 4. Obtener tareas recientes (últimas 5)
    const tareas = await this.tareasService.findAllByObra(obraId);
    const tareasRecientes = tareas.slice(0, 5).map((t) => ({
      titulo: t.titulo,
      estado: t.estado,
      avance: t.avance_porcentaje,
    }));

    // 5. Obtener últimas bitácoras (últimas 3) para contexto
    const bitacorasAnteriores = await this.findAllByObra(obraId);
    const ultimasBitacoras = bitacorasAnteriores.slice(0, 3).map((b) => ({
      fecha: b.fecha,
      avance: b.avance_porcentaje,
    }));

    // 6. Formatear materiales para el prompt
    const materialesFormateados = materiales.map((m) => ({
      nombre: m.nombre,
      cantidad: m.cantidad
        ? `${m.cantidad} ${m.unidad || ''}`.trim()
        : 'Sin especificar',
    }));

    // 7. Preparar fecha
    const fecha = dto.fecha || new Date().toISOString().split('T')[0];

    // 8. Preparar información del usuario para la firma
    const nombreUsuario =
      `${usuario.firstName || ''} ${usuario.lastName || ''}`.trim() ||
      usuario.email ||
      'Usuario';
    const cargoUsuario = usuario.role?.name || 'Ingeniero de Obra';
    const emailUsuario = usuario.email || 'sin-email@ejemplo.com';

    // 9. Llamar al servicio de IA
    const resultado = await this.aiService.generarInformeBitacora({
      obra: obra.nombre,
      ubicacion: obra.direccion || 'Ubicación no especificada',
      fecha: fecha,
      clima: dto.clima,
      actividades: dto.actividades,
      materiales: materialesFormateados,
      incidencias: dto.incidencias,
      avanceGeneral: dto.avanceGeneral,
      observaciones: dto.observaciones,
      tareasRecientes: tareasRecientes,
      ultimasBitacoras: ultimasBitacoras,
      usuarioGenerador: {
        nombre: nombreUsuario,
        cargo: cargoUsuario,
        email: emailUsuario,
      },
    });

    // 10. Guardar la bitácora generada por IA en la base de datos
    const descripcion = `Bitácora generada por IA - ${dto.actividades.join(', ')}`;
    const bitacora = this.bitacoraRepository.create({
      obra_id: obraId,
      usuario_id: usuarioId,
      descripcion: descripcion,
      avance_porcentaje: dto.avanceGeneral,
      fecha: new Date(fecha),
      generada_por_ia: true,
      archivos: [],
    });
    const bitacoraGuardada = await this.bitacoraRepository.save(bitacora);

    return {
      html: resultado.html,
      tokensUsados: resultado.tokensUsados,
      bitacora: bitacoraGuardada,
    };
  }

  async responderPreguntaObra(
    obraId: string,
    pregunta: string,
  ): Promise<{ respuesta: string; tokensUsados?: number }> {
    // 1. Obtener información de la obra
    const obra = await this.obrasService.findOne(obraId);
    if (!obra) {
      throw new NotFoundException(`Obra con ID ${obraId} no encontrada`);
    }

    // 2. Obtener materiales de la obra
    const materiales = await this.materialesService.findAllByObra(obraId);

    // 3. Obtener tareas de la obra
    const tareas = await this.tareasService.findAllByObra(obraId);

    // 4. Obtener bitácoras de la obra
    const bitacoras = await this.findAllByObra(obraId);

    // 5. Obtener asistencias (opcional, si existe el servicio)
    // const asistencias = await this.asistenciasService.findAllByObra(obraId);

    // 6. Obtener último avance (de la última bitácora)
    const ultimoAvance =
      bitacoras.length > 0 ? bitacoras[0].avance_porcentaje : undefined;

    // 7. Preparar información para la IA
    const informacionObra = {
      nombre: obra.nombre,
      ubicacion: obra.direccion,
      materiales: materiales.map((m) => ({
        nombre: m.nombre,
        cantidad: m.cantidad ? Number(m.cantidad) : undefined,
        unidad: m.unidad,
        categoria: m.categoria,
      })),
      tareas: tareas.map((t) => ({
        titulo: t.titulo,
        estado: t.estado,
        avance: t.avance_porcentaje ? Number(t.avance_porcentaje) : undefined,
      })),
      bitacoras: bitacoras.map((b) => ({
        fecha: b.fecha,
        avance: Number(b.avance_porcentaje),
        descripcion: b.descripcion,
      })),
      ultimoAvance: ultimoAvance ? Number(ultimoAvance) : undefined,
    };

    // 8. Llamar al servicio de IA
    const resultado = await this.aiService.responderPreguntaObra({
      pregunta: pregunta,
      informacionObra: informacionObra,
    });

    return resultado;
  }
}
