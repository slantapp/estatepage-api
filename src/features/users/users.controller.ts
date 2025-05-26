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

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUserByID(@Req() req: Request) {
    const userId = (req.user as User).id;
    return this.usersService.getUserById(userId);
  }

 
}
