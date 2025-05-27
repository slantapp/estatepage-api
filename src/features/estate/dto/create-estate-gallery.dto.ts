import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateEstateGalleryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  estateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  imageUrl: string;
}

export class BulkCreateEstateGalleryDto {
  @ValidateNested({ each: true })
  @Type(() => CreateEstateGalleryDto)
  items: CreateEstateGalleryDto[];
}