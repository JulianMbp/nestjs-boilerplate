import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialEntity } from './infrastructure/persistence/relational/entities/material.entity';

@Injectable()
export class MaterialesService {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
  ) {}

  async create(
    obraId: string,
    createMaterialDto: CreateMaterialDto,
  ): Promise<MaterialEntity & { cantidad_faltante: number }> {
    const material = this.materialRepository.create({
      ...createMaterialDto,
      obra_id: obraId,
      cantidad_disponible: createMaterialDto.cantidad_disponible ?? 0,
    });
    const materialGuardado = await this.materialRepository.save(material);

    // Calcular cantidad_faltante
    const cantidadRequerida = materialGuardado.cantidad_requerida
      ? Number(materialGuardado.cantidad_requerida)
      : materialGuardado.cantidad
      ? Number(materialGuardado.cantidad)
      : 0;
    const cantidadDisponible = materialGuardado.cantidad_disponible
      ? Number(materialGuardado.cantidad_disponible)
      : 0;
    const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDisponible);

    return {
      ...materialGuardado,
      cantidad_faltante: cantidadFaltante,
    } as MaterialEntity & { cantidad_faltante: number };
  }

  async findAllByObra(
    obraId: string,
    estado?: string,
  ): Promise<(MaterialEntity & { cantidad_faltante: number })[]> {
    const where: any = { obra_id: obraId };
    if (estado) {
      where.estado = estado;
    }
    const materiales = await this.materialRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    // Calcular cantidad_faltante para cada material
    return materiales.map((material) => {
      const cantidadRequerida = material.cantidad_requerida
        ? Number(material.cantidad_requerida)
        : material.cantidad
        ? Number(material.cantidad)
        : 0;
      const cantidadDisponible = material.cantidad_disponible
        ? Number(material.cantidad_disponible)
        : 0;
      const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDisponible);

      return {
        ...material,
        cantidad_faltante: cantidadFaltante,
      } as MaterialEntity & { cantidad_faltante: number };
    });
  }

  async findOneByIdInObra(
    id: string,
    obraId: string,
  ): Promise<MaterialEntity & { cantidad_faltante: number }> {
    const material = await this.materialRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!material) {
      throw new NotFoundException('Material not found in this obra');
    }

    // Calcular cantidad_faltante
    const cantidadRequerida = material.cantidad_requerida
      ? Number(material.cantidad_requerida)
      : material.cantidad
      ? Number(material.cantidad)
      : 0;
    const cantidadDisponible = material.cantidad_disponible
      ? Number(material.cantidad_disponible)
      : 0;
    const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDisponible);

    return {
      ...material,
      cantidad_faltante: cantidadFaltante,
    } as MaterialEntity & { cantidad_faltante: number };
  }

  async updateInObra(
    id: string,
    obraId: string,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<MaterialEntity & { cantidad_faltante: number }> {
    const material = await this.materialRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!material) {
      throw new NotFoundException('Material not found in this obra');
    }

    Object.assign(material, updateMaterialDto);
    const materialActualizado = await this.materialRepository.save(material);

    // Calcular cantidad_faltante
    const cantidadRequerida = materialActualizado.cantidad_requerida
      ? Number(materialActualizado.cantidad_requerida)
      : materialActualizado.cantidad
      ? Number(materialActualizado.cantidad)
      : 0;
    const cantidadDisponible = materialActualizado.cantidad_disponible
      ? Number(materialActualizado.cantidad_disponible)
      : 0;
    const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDisponible);

    return {
      ...materialActualizado,
      cantidad_faltante: cantidadFaltante,
    } as MaterialEntity & { cantidad_faltante: number };
  }

  async deleteInObra(id: string, obraId: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!material) {
      throw new NotFoundException('Material not found in this obra');
    }

    await this.materialRepository.remove(material);
  }
}
