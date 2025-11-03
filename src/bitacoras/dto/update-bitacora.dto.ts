import { PartialType } from '@nestjs/swagger';
import { CreateBitacoraDto } from './create-bitacora.dto';

export class UpdateBitacoraDto extends PartialType(CreateBitacoraDto) {}
