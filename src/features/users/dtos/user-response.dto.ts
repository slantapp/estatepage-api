// import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CreateUserDto } from './user.dto';

export class UserResponseDto extends CreateUserDto {
    @Expose()
    id: string;

    @Expose()
    role: string;

    @Expose()
    estateId: string;
}
