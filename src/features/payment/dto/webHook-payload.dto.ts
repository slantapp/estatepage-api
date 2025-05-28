import { IsDate, IsString } from "class-validator";

export class WebhookDto {
    @IsString()
    userId: string;

    @IsString()
    serviceId: string;

    @IsString()
    amount: number;

    @IsString()
    status: string;

    @IsString()
    transactionReference: string;

    @IsDate()
    paymentDate: Date;

    @IsString()
    currency: string;

    @IsString()
    fullName: string;

    @IsString()
    email: string;

    @IsString()
    transactionId: string;

    @IsString()
    tx_ref: string
}


