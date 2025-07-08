import { IsEmail, IsObject, IsString, MinLength } from 'class-validator';


export class AdminDto {
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;
}

export class CreateEstateDto {
    @IsString()
    name: string;

    @IsString()
    address: string;

    @IsEmail()
    @IsString()
    supportEmail?: string;
    
    @IsString()
    supportPhone?: string;

    @IsObject()
    admin: AdminDto;
}
