import { PickType } from '@nestjs/swagger';
import { CreateNewUserDto } from './create-new-user.dto';

export class PasswordRequestDTO extends PickType(CreateNewUserDto, ['email']) {}
