import { Obra } from '../../../../domain/obra';
import { ObraEntity } from '../entities/obra.entity';

export class ObraMapper {
  static toDomain(raw: ObraEntity): Obra {
    const domainEntity = new Obra();
    domainEntity.id = raw.id;
    domainEntity.nombre = raw.nombre;
    domainEntity.direccion = raw.direccion ?? '';
    domainEntity.createdAt = raw.created_at;
    domainEntity.updatedAt = raw.updated_at;

    // TODO: Fix mapper for UsuarioEntity
    // if (raw.admin) {
    //   domainEntity.administrador = UserMapper.toDomain(raw.admin);
    // }

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
      persistenceEntity.created_at = domainEntity.createdAt;
    }
    if (domainEntity.updatedAt) {
      persistenceEntity.updated_at = domainEntity.updatedAt;
    }

    return persistenceEntity;
  }
}
