import { PartialType } from '@nestjs/swagger';
import { CreateEstateServiceDto } from './create-estate-service.dto';

export class UpdateEstateServiceDto extends PartialType(CreateEstateServiceDto) {}
