import { OmitType, PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateNewUserDto } from 'src/futures/auth/dtos/create-new-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateNewUserDto, ['password', 'email']),
) {
  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  userID: string;
}
