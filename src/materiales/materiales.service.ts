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
  ): Promise<MaterialEntity> {
    const material = this.materialRepository.create({
      ...createMaterialDto,
      obra_id: obraId,
    });
    return this.materialRepository.save(material);
  }

  async findAllByObra(obraId: string): Promise<MaterialEntity[]> {
    return this.materialRepository.find({
      where: { obra_id: obraId },
      order: { created_at: 'DESC' },
    });
  }

  async findOneByIdInObra(id: string, obraId: string): Promise<MaterialEntity> {
    const material = await this.materialRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!material) {
      throw new NotFoundException('Material not found in this obra');
    }

    return material;
  }

  async updateInObra(
    id: string,
    obraId: string,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<MaterialEntity> {
    const material = await this.findOneByIdInObra(id, obraId);
    Object.assign(material, updateMaterialDto);
    return this.materialRepository.save(material);
  }

  async deleteInObra(id: string, obraId: string): Promise<void> {
    const material = await this.findOneByIdInObra(id, obraId);
    await this.materialRepository.remove(material);
  }
}
