import { Injectable } from '@nestjs/common';
import jsonResponse from 'src/common/utils/lib';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/user.dto';
import { CreateNewUserDto } from '../auth/dtos/create-new-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserById(userID: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userID } });
  }

  async createNewUser(
    details: CreateNewUserDto,
    res: Response,
  ): Promise<User | void> {
    const isUser = await this.getUserByEmail(details.email);

    if (isUser) {
      jsonResponse(
        StatusCodes.BAD_REQUEST,
        '',
        res,
        'The email provided is already in use. Please use another email.',
      );
      return;
    }
     const userID = randomUUID();
     console.log('User ID:', userID);
    try {
      const newUser = await this.prisma.user.create({
        data: {  id: userID as string,...details },
      });
      return newUser;
    } catch (error) {
      console.error(error);
      jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, '', res);
    }
  }

  async updateUser(
    userId: string,
    userDetails: Partial<UpdateUserDto>,
    res: Response,
  ): Promise<User | void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        jsonResponse(StatusCodes.BAD_REQUEST, '', res, 'Invalid User Id');
        return;
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: userDetails,
      });
      return updatedUser;
    } catch (error) {
      console.error(error);
      jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, '', res, error.message);
    }
  }

  async getUserByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetOTP: token },
    });
  }

  async getUserByOTP(otp: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: { verificationOTP: otp },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}