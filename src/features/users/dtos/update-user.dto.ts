import { OmitType, PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { VerificationStatus } from '@prisma/client';
import { CreateNewUserDto } from 'src/features/auth/dtos/create-new-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateNewUserDto, ['password', 'email']),
) {
  @ApiProperty()
  @IsOptional()
  profileUrl: string;

  @ApiProperty()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsOptional()
  houseAddress?: string;

  @ApiProperty()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsOptional()
  verificationStatus?: VerificationStatus;

  @ApiProperty()
  @IsOptional()
  emailVerifiedAt?: bigint;

  @ApiProperty({ nullable: true })
  @IsOptional()
  verificationOTP?: string | null;


  @ApiProperty()
  @IsOptional()
  passwordResetOTP?: string ;

}
