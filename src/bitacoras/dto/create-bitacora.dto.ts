import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBitacoraDto {
  @ApiProperty({ description: 'Description of the work log entry' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Progress percentage must be at least 0' })
  @Max(100, { message: 'Progress percentage cannot exceed 100' })
  @Transform(({ value }) => parseFloat(value))
  avance_porcentaje: number;

  @ApiPropertyOptional({
    description: 'Array of file URLs',
    type: [String],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  archivos?: string[];

  @ApiPropertyOptional({ description: 'Date of the log entry' })
  @IsOptional()
  @IsDateString()
  fecha?: Date;
}
