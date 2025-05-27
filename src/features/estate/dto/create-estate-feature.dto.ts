import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateEstateFeatureDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  estateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  featureName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  iconUrl?: string;
}


export class BulkCreateEstateFeatureDto {
  @ValidateNested({ each: true })
  @Type(() => CreateEstateFeatureDto)
  items: CreateEstateFeatureDto[];
}