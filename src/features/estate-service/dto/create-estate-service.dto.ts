import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer"; // ✅ Import this
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
  @ApiProperty({ enum: BillingCycle })
  billingCycle: BillingCycle;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;

  // @IsDate()
  // @IsNotEmpty()
  // @Type(() => Date) 
  // @ApiProperty({ type: String, format: 'date-time' })
  // startDate: Date;

  // @IsDate()
  // @IsNotEmpty()
  // @Type(() => Date) 
  // @ApiProperty({ type: String, format: 'date-time' })
  // endDate: Date;
}
