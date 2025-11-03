import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { Obra } from '../../../../domain/obra';
import { ObraEntity } from '../entities/obra.entity';

export class ObraMapper {
  static toDomain(raw: ObraEntity): Obra {
    const domainEntity = new Obra();
    domainEntity.id = raw.id;
    domainEntity.nombre = raw.nombre;
    domainEntity.direccion = raw.direccion;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    if (raw.administrador) {
      domainEntity.administrador = UserMapper.toDomain(raw.administrador);
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Obra): ObraEntity {
    const persistenceEntity = new ObraEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.nombre = domainEntity.nombre;
    persistenceEntity.direccion = domainEntity.direccion;
    if (domainEntity.createdAt) {
      persistenceEntity.createdAt = domainEntity.createdAt;
    }
    if (domainEntity.updatedAt) {
      persistenceEntity.updatedAt = domainEntity.updatedAt;
    }

    return persistenceEntity;
  }
}
