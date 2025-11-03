import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class AsignarUsuarioObraDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la obra',
  })
  @IsNotEmpty()
  @IsUUID()
  obraId: string;

  @ApiProperty({
    example: 4,
    description: 'ID del rol (ejemplo: 4 para admin_obra)',
  })
  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}
