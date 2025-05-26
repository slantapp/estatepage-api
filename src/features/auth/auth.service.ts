import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ContextStore } from 'src/common/interface/context_store';
import { ClsService } from 'nestjs-cls';
import jsonResponse from 'src/common/utils/lib';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Response } from 'express';
import { Verifications } from 'src/common/enums/enums';
import { CreateNewUserDto } from './dtos/create-new-user.dto';
import * as otpGenerator from 'otp-generator';
import { encrypt } from 'src/common/utils/encryptor.utils';
import { PasswordRequestDTO } from './dtos/forget-password.dto';
// import { EmailService } from '../email/email.service';
import { PasswordResetDTO } from './dtos/reset-password.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../users/dtos/user.dto';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { User } from '@prisma/client';
import { Not } from 'typeorm';
// import dayjs from 'dayjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly cls: ClsService<ContextStore>,
    ) { }

    async validate(email: string, password: string): Promise<User | null> {
        try {
            const user = await this.usersService.getUserByEmail(email);

            if (!user) {
                throw new Error('Invalide email or password');
            }
            // if (user.verifiedUser === Verifications.UNVERIFIED) {
            //   throw new UnauthorizedException(
            //     `This email address hasn't been verified. Use the OTP sent to your email address to complete verification.`,
            //   );
            // }
            const passwordIsValid = await encrypt.comparepassword(
                user.password,
                password,
            );

            if (passwordIsValid === false) {
                throw new UnauthorizedException('Invalide email or password');
            }
            return passwordIsValid ? user : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     * @description create new User
     * @param createUserDto user data
     * @param res Express Response
     * @returns user
     */
    async createAccount(
        createUserDto: CreateNewUserDto,
        res: Response,
    ): Promise<User | void> {
        try {

            const verificationOtp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: true,
                lowerCaseAlphabets: false,
            });


            // encrypt the password
            if (!createUserDto.password) {
                throw new Error('Password is required');
            }
            createUserDto.password = await encrypt.encryptpass(
                createUserDto.password,
            );

            const userSaving = {
                ...createUserDto,
                verificationOTP: verificationOtp,
            };



            console.log('User Saving:', userSaving);
            const saveduser = await this.usersService.createNewUser(userSaving, res);
            // console.log('savedUser', saveduser);
            //   await new EmailService(
            //     saveduser as User,
            //     '',
            //     createUserDto.email,
            //     verificationOtp,
            //   ).EmailVerification();

            // Transform saved user into UserResponseDto
            const responseDto = plainToInstance(UserResponseDto, saveduser, {
                excludeExtraneousValues: true, // Ensures only `@Expose` fields are included
            });

            return jsonResponse(StatusCodes.OK, responseDto, res);
        } catch (error) {
            console.error(error);
        }
    }

    /**
  * @description Update user information
  * @param details User data
  * @param res Express Response
  * @param next Express NextFunction
  */
    async updateProfile(
        details: UpdateUserDto,
        res: Response,
    ) {
        try {
            const userID = details.id;

            if (!userID) {
                return jsonResponse(StatusCodes.BAD_REQUEST, '', res, 'User ID is required');
            }

            const user = await this.usersService.getUserById(userID);

            if (!user) {
                return jsonResponse(StatusCodes.NOT_FOUND, '', res, 'User not found');
            }

            const updatedUser = await this.usersService.updateUser(details);

            if (!updatedUser) {
                return jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, '', res, 'Failed to update user');
            }

            return jsonResponse(StatusCodes.OK, updatedUser, res, 'User profile updated successfully');
        } catch (error) {
            console.error(error);

            if (error instanceof NotFoundException) {
                return jsonResponse(StatusCodes.NOT_FOUND, '', res, error.message);
            }

            throw new Error('An error occurred while updating the user profile');
        }
    }

    /**
     * @describe login user
     * @param user user data
     * @returns user
     */
    async login(user: Partial<User>, res: Response) {
        try {
            const payload = {
                email: user.email,
                sub: user.id,
                userID: user.id,
            };

            const token = this.jwtService.sign(payload);
            // Transform saved user into UserResponseDto
            const responseDto = plainToInstance(UserResponseDto, user, {
                excludeExtraneousValues: true, // Ensures only `@Expose` fields are included
            });
            return jsonResponse(
                StatusCodes.OK, {
                access_token: token
            }, res)

        } catch (error) {
            console.error(error);
        }
    }
    /**
     * @description to verify user account
     * @param OTP string OTP
     * @param res Express response
     * @returns
     */
    async emailVerification(otp: string, res: Response) {
        const user = await this.usersService.getUserByOTP(otp);
        if (!user) {
            jsonResponse(StatusCodes.BAD_REQUEST, '', res, 'Invalid token or token has expired');
            return;
        }
        if (user.verificationStatus === Verifications.VERIFIED) {
            jsonResponse(
                StatusCodes.BAD_REQUEST,
                '',
                res,
                'Your account as already been verified',
            );
            return;
        }
        const verifyUser = {
            ...user,
            verificationStatus: Verifications.VERIFIED,
            emailVerifiedAt: BigInt(Date.now()),
            verificationOTP: null,
        } as UpdateUserDto;

        this.usersService.updateUser(verifyUser);

        return 'Email verified successfully';
    }

    /**
     * @description send otp to user email
     * @param userDetails user data
     * @param res Express response
     * @returns
     */
    async forgetPassword(userDetails: PasswordRequestDTO, res: Response) {
        try {
            const user = await this.usersService.getUserByEmail(userDetails.email);
            if (!user) {
                jsonResponse(StatusCodes.NOT_FOUND, '', res);
                return;
            }

            if (user.verificationStatus === Verifications.UNVERIFIED) {
                jsonResponse(
                    StatusCodes.BAD_REQUEST,
                    '',
                    res,
                    'Your account has not been verified yet.',
                );
                return;
            }

            const passwordResetOTP = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: true,
                lowerCaseAlphabets: false,
            });
            // const PasswordResteToken = encrypt.getPasswordResetToken(user);
            console.log(passwordResetOTP);
            const verifyUser = {
                ...user,
                passwordResetOTP,
            } as UpdateUserDto;

            const updatedUser = await this.usersService.updateUser(
                verifyUser,

            );

            //   await new EmailService(
            //     user,
            //     '',
            //     null,
            //     passwordResetOTP,
            //   ).sendPasswordReset();

            jsonResponse(
                StatusCodes.OK,
                updatedUser,
                res,
                'Check your email for link',
            );
        } catch (error) {
            console.error(error);
            jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, '', res, error.message);
        }
    }
    /**
     * @description resend password reset link
     * @param passwordRequestDto
     * @param res
     */
    async resendLink(passwordRequestDto: PasswordRequestDTO, res: Response) {
        try {
            const user = await this.usersService.getUserByEmail(
                passwordRequestDto.email,
            );

            if (!user) {
                return jsonResponse(StatusCodes.NOT_FOUND, '', res, 'User not found');
            }

            const passwordResetOTP = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: true,
                lowerCaseAlphabets: false,
            });

            //   await new EmailService(
            //     user,
            //     ' ',
            //     passwordRequestDto.email,
            //     passwordResetOTP,
            //   ).sendPasswordReset();

            // Update the user with the reset token and expiration
            user.passwordResetOTP = passwordResetOTP;
            user.resetTokenExpiresAt = BigInt(Date.now() + 15 * 60 * 1000); // Example expiration time

            await this.usersService.updateUser(
                { ...user } as UpdateUserDto
            );

            return jsonResponse(
                StatusCodes.OK,
                '',
                res,
                'Check your email for the reset link',
            );
        } catch (error) {
            console.error('Error in resendLink:', error);
            return jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, '', res);
        }
    }

    /**
     * @description reset user password using token
     * @dev new password will be updated at entity level
     * @param passwordResetDTO object token and newPassword
     * @param res Express Response
     * @returns
     */
    async resetPassword(passwordResetDTO: PasswordResetDTO, res: Response) {
        try {
            const user = await this.usersService.getUserByPasswordResetToken(
                passwordResetDTO.OTP,
            );

            if (!user) {
                return jsonResponse(
                    StatusCodes.BAD_REQUEST,
                    '',
                    res,
                    'Invalid token or token has expired',
                );
            }

            user.password = passwordResetDTO.newPassword;
            user.passwordResetToken = null;
            user.resetTokenExpiresAt = null;

            await this.usersService.updateUser({
                ...user as UpdateUserDto,
             
            });

            jsonResponse(
                StatusCodes.OK,
                null,
                res,
                'Password has been reset successfully',
            );
        } catch (error) {
            console.error('Error in resetPassword:', error);
            jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, null, res);
        }
    }
}
