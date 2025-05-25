import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserKycDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  NIN: string;

  @ApiProperty()
  NINImgUrl: string;

  @IsString()
  userID: string;
}
