import { IsEmail, IsString, MinLength } from 'class-validator';


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

    supportEmail?: string;
    
    supportPhone?: string;

    admin: AdminDto;
}
