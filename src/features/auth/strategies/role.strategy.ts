// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/common/enums/enums';

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);
