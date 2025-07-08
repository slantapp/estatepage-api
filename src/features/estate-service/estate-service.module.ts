import { Module } from '@nestjs/common';
import { EstateServiceService } from './estate-service.service';
import { EstateServiceController } from './estate-service.controller';
import { BillingService } from '../payment/billing.service';

@Module({
  controllers: [EstateServiceController],
  providers: [EstateServiceService, BillingService],
})
export class EstateServiceModule {}
