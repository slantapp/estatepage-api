import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guard/JWT-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { Roles } from '../auth/strategies/role.strategy';
import { RolesGuard } from '../auth/guard/auth.guard';
import { User } from '@prisma/client';
import { UserRoles } from 'src/common/enums/enums';
import jsonResponse from 'src/common/utils/lib';
import { StatusCodes } from 'http-status-codes';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getUserByID(@Req() req: Request) {
    const userId = (req.user as User).id;
    return this.usersService.getUserById(userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async getAllUsers(@Res() res: Response) {
    try {
      const users = await this.usersService.getAllUsers();
      jsonResponse(StatusCodes.OK, {users}, res, 'Users fetched successfully');
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
      });
    }
  }

}
