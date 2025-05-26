import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { BillingCycle, ServiceStatus } from "src/common/enums/enums";

export class CreateEstateServiceDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    price: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    estateId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    billingCycle: BillingCycle;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    status: ServiceStatus;

    @IsDate()
    @IsNotEmpty()
    @ApiProperty()
    startDate: Date;

    @IsDate()
    @IsNotEmpty()
    @ApiProperty()
    endDate: Date;




}
