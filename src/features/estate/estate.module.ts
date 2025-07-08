import { Module } from '@nestjs/common';
import { EstateService } from './estate.service';
import { EstateController } from './estate.controller';
import { BillingService } from '../payment/billing.service';

@Module({
  controllers: [EstateController],
  providers: [EstateService, BillingService],
  exports: [EstateService, BillingService],
})
export class EstateModule {}
