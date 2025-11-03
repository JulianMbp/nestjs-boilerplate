import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateObraDto {
  @ApiProperty({
    example: 'Edificio Central Plaza',
    description: 'Nombre de la obra',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Calle 123 #45-67, Bogotá',
    description: 'Dirección de la obra',
  })
  @IsNotEmpty()
  @IsString()
  direccion: string;

  @ApiProperty({
    example: 1,
    description: 'ID del administrador de la obra (user table)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  administradorId?: number;
}
