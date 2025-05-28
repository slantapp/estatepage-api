import { PartialType } from '@nestjs/swagger';
import { CreateEstateDto } from './create-estate.dto';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEstateDto extends PartialType(CreateEstateDto) {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    apiKey: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    apiSecret: string;

    @IsEmail()
    @IsNotEmpty()
    @IsOptional()
    email?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    phone: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    supportEmail?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    supportPhone?: string;

    @IsBoolean()
    @IsOptional()
    smsNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    emailNotifications?: boolean;

     @IsBoolean()
    @IsOptional()
    paymentReminders?: boolean;

    @IsNumber()
    @IsOptional()
    paymentGracePeriod?: number;
    
    @IsNumber()
    @IsOptional()
    reminderDays?: number;

    @IsString()
    @IsOptional()
    currency?: string;
   
}
