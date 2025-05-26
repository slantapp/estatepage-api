import { Module } from '@nestjs/common';
import { EstateService } from './estate.service';
import { EstateController } from './estate.controller';

@Module({
  controllers: [EstateController],
  providers: [EstateService],
})
export class EstateModule {}
