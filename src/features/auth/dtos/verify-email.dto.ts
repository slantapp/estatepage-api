import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EmailVerificationDto {
  @ApiProperty({ example: '123456', description: 'OTP for email verification' })
  @IsString()
  token: string;
}
