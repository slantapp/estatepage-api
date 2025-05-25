import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    // console.log('email and password', email, password);

    const user = await this.authService.validate(email, password);
    // console.log('user on validation', user);

    if (!user) {
      throw new UnauthorizedException(
        'You have entered an invalid email and password combination.',
      );
    }

    return user;
  }
}
