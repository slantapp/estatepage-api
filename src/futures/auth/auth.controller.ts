import {
  Body,
  Controller,
  Next,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateNewUserDto } from './dtos/create-new-user.dto';
import { LoginDto } from './dtos/login.dto';
import { NextFunction, Request, Response } from 'express';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { EmailVerificationDto } from './dtos/verify-email.dto';
import { PasswordRequestDTO } from './dtos/forget-password.dto';
import { PasswordResetDTO } from './dtos/reset-password.dto';
// import { UserDto } from '../users/dtos/user.dto';
import { Serialize } from 'src/interceptor/serializer.interceptor';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { JwtAuthGuard } from './guard/JWT-auth.guard';
import { UserKycDto } from './dtos/kyc.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Serialize(UserResponseDto)
  @ApiBody({ type: CreateNewUserDto })
  async createUser(
    @Body() createUserDto: CreateNewUserDto,
    @Res() res: Response,
  ) {
    return await this.authService.createAccount(createUserDto, res);
  }

  @Post('verify-email')
  @ApiBody({ type: EmailVerificationDto })
  async emailVerification(
    @Query() emailVerificationDto: EmailVerificationDto,
    @Res() res: Response,
  ) {
    return await this.authService.emailVerification(
      emailVerificationDto.token,
      res,
    );
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  async login(@Req() req: Request,  @Res() res: Response,) {
    const user = req.user as User;
    return await this.authService.login(user, res);
  }

  @Post('forget-password')
  @ApiBody({ type: PasswordRequestDTO })
  async forgetPassword(
    @Body() details: PasswordRequestDTO,
    @Res() res: Response,
  ) {
    return await this.authService.forgetPassword(details, res);
  }

  @Post('reset-password')
  @ApiBody({ type: PasswordResetDTO })
  async resetPasword(@Body() details: PasswordResetDTO, @Res() res: Response) {
    return await this.authService.resetPassword(details, res);
  }

  @Post('resend-link')
  @ApiBody({ type: PasswordRequestDTO })
  async resendLink(@Body() details: PasswordRequestDTO, @Res() res: Response) {
    return await this.authService.resendLink(details, res);
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @Body() details: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    details.userID = (req.user as User).id;
    return await this.authService.updateProfile(details, res, next);
  }

 
}
