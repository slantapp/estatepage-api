import { Module } from '@nestjs/common';
import { EstateServiceService } from './estate-service.service';
import { EstateServiceController } from './estate-service.controller';

@Module({
  controllers: [EstateServiceController],
  providers: [EstateServiceService],
})
export class EstateServiceModule {}
