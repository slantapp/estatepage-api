import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/futures/users/users.service';
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

  async validate(validationPayload: {
    email: string;
    sub: string;
    userID: string;
  }): Promise<User> {
    try {
      console.log('JWT Payload:', validationPayload);

      this.cls.set('email', validationPayload.email);

      const user = await this.userService.getUserById(validationPayload.userID);

      if (!user) {
        console.log(user);
        throw new UnauthorizedException('User not found');
      }

      this.cls.set('userID', user.id);

      return user || null;
    } catch (error) {
      console.error('Validation Error:', error.message);
      throw new UnauthorizedException('Invalid token');}
  }
}
