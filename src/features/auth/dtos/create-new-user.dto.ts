import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateNewUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;


  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  houseAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

 
}
