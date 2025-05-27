import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateEstateStreetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  estateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  streetName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  imageUrl: string;
}


export class BulkCreateEstateStreetDto {
  @ValidateNested({ each: true })
  @Type(() => CreateEstateStreetDto)
  items: CreateEstateStreetDto[];
}