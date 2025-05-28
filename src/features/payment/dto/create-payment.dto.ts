import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {
    @IsString()
    @IsOptional()
    userId: string;

    @IsString()
    serviceId: string;

    @IsString()
    serviceName?: string;

    @IsNumber()
    amount: number;

    @IsString()
    currency?: string;

    @IsString()
    fullName?: string;

    @IsString()
    email?: string;
}


