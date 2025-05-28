import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/features/users/users.service';
import { ContextStore } from 'src/common/interface/context_store';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService<ContextStore>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    email: string;
    sub: string; // standard JWT
    estateId: string;
  }): Promise<User> {
    try {
      // console.log('JWT Payload:', payload);

      const user = await this.userService.getUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Set context
      this.cls.set('email', user.email);
      this.cls.set('userID', user.id);
      this.cls.set('role', user.role);
      this.cls.set('estateId', user.estateId!);

      return user;
    } catch (error) {
      console.error('Validation Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
