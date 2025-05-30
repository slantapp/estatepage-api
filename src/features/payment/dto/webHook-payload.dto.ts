import { IsDate, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class WebhookCustomerDto {
  
    @IsString()
    fullName: string;

   
    @IsString()
    email: string;
}

// class WebhookCardDto {
//     @IsString()
//     first_6digits: string;

//     @IsString()
//     last_4digits: string;

//     @IsString()
//     issuer: string;

//     @IsString()
//     country: string;

//     @IsString()
//     type: string;

//     @IsString()
//     expiry: string;
// }


class WebhookDataDto {
    @IsNumber()
    id: number;

    @IsString()
    tx_ref: string;

    @IsString()
    flw_ref: string;

    @IsString()
    device_fingerprint: string;

    @IsNumber()
    amount: number;

    @IsString()
    currency: string;

    @IsNumber()
    charged_amount: number;

    @IsNumber()
    app_fee: number;

    @IsNumber()
    merchant_fee: number;

    @IsString()
    processor_response: string;

    @IsString()
    auth_model: string;

    @IsString()
    ip: string;

    @IsString()
    narration: string;

    @IsString()
    status: string;

    @IsString()
    payment_type: string;

    @IsString()
    created_at: string;

    @IsNumber()
    account_id: number;

    @ValidateNested()
    @Type(() => WebhookCustomerDto)
    customer: WebhookCustomerDto;

  
}


export class WebhookDto {
    @IsString()
    event: string;

    @ValidateNested()
    @Type(() => WebhookDataDto)
    data: WebhookDataDto;
}

