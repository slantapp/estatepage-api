import { PartialType } from '@nestjs/swagger';
import { CreateEstateServiceDto } from './create-estate-service.dto';
import { IsBoolean } from 'class-validator';

export class UpdateEstateServiceDto extends PartialType(CreateEstateServiceDto) {
    @IsBoolean()
    isActive?: boolean; // Optional field to update service status
}
