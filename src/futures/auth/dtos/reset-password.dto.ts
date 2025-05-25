import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordResetDTO {
  @ApiProperty()
  @IsString()
  OTP: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}
