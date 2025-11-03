import { ApiProperty } from '@nestjs/swagger';

export class ObraConRoleDto {
  @ApiProperty({
    description: 'ID de la obra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la obra',
    example: 'Edificio Central Plaza',
  })
  nombre: string;

  @ApiProperty({
    description: 'Dirección de la obra',
    example: 'Calle 100 #15-20, Bogotá D.C.',
    required: false,
  })
  direccion?: string;

  @ApiProperty({
    description: 'Estado de la obra',
    example: 'activa',
  })
  estado: string;

  @ApiProperty({
    description: 'Nombre del rol del usuario en esta obra',
    example: 'Admin Obra',
    required: false,
  })
  roleName?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la obra',
    example: '2024-01-15',
    required: false,
  })
  fecha_inicio?: Date;

  @ApiProperty({
    description: 'Fecha de fin de la obra',
    example: '2024-12-31',
    required: false,
  })
  fecha_fin?: Date;
}
