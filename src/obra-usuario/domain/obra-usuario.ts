import { ApiProperty } from '@nestjs/swagger';
import { Obra } from '../../obras/domain/obra';
import { Role } from '../../roles/domain/role';
import { User } from '../../users/domain/user';

export class ObraUsuario {
  @ApiProperty({
    type: String,
    description: 'ID único de la asignación (UUID)',
  })
  id: string;

  @ApiProperty({
    type: () => User,
    description: 'Usuario asignado',
  })
  user?: User;

  @ApiProperty({
    type: () => Obra,
    description: 'Obra asignada',
  })
  obra?: Obra;

  @ApiProperty({
    type: () => Role,
    description: 'Rol del usuario en la obra',
  })
  role?: Role;

  @ApiProperty({
    type: Date,
    description: 'Fecha de asignación',
  })
  fechaAsignacion: Date;

  @ApiProperty({
    type: Date,
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Fecha de actualización',
  })
  updatedAt: Date;
}
