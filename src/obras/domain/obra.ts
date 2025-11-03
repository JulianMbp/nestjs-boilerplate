import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class Obra {
  @ApiProperty({
    type: String,
    description: 'ID único de la obra (UUID)',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Nombre de la obra',
    example: 'Edificio Central Plaza',
  })
  nombre: string;

  @ApiProperty({
    type: String,
    description: 'Dirección de la obra',
    example: 'Calle 123 #45-67, Bogotá',
  })
  direccion: string;

  @ApiProperty({
    type: () => User,
    description: 'Administrador de la obra',
  })
  administrador?: User | null;

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
