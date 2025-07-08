import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { BillingService } from './billing.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [PaymentController],
  providers: [PaymentService, BillingService],
  exports: [PaymentService, BillingService],
})
export class PaymentModule {}
