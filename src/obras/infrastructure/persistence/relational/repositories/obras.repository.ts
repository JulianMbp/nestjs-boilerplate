import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { Obra } from '../../../../domain/obra';
import { ObraEntity } from '../entities/obra.entity';
import { ObraMapper } from '../mappers/obra.mapper';

@Injectable()
export class ObrasRelationalRepository {
  constructor(
    @InjectRepository(ObraEntity)
    private readonly obraRepository: Repository<ObraEntity>,
  ) {}

  async create(data: Obra): Promise<Obra> {
    const persistenceModel = ObraMapper.toPersistence(data);
    const newEntity = await this.obraRepository.save(
      this.obraRepository.create(persistenceModel),
    );
    return ObraMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Obra[]> {
    const entities = await this.obraRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((obra) => ObraMapper.toDomain(obra));
  }

  async findById(id: Obra['id']): Promise<NullableType<Obra>> {
    const entity = await this.obraRepository.findOne({
      where: { id },
    });

    return entity ? ObraMapper.toDomain(entity) : null;
  }

  async update(id: Obra['id'], payload: Partial<Obra>): Promise<Obra> {
    const entity = await this.obraRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Obra not found');
    }

    const updatedEntity = await this.obraRepository.save(
      this.obraRepository.create(
        ObraMapper.toPersistence({
          ...ObraMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ObraMapper.toDomain(updatedEntity);
  }

  async remove(id: Obra['id']): Promise<void> {
    await this.obraRepository.delete(id);
  }
}
