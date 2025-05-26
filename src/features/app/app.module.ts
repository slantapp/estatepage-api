import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { appModules } from './app_modules';

@Module({
  imports: appModules,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
