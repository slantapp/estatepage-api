import { Type, DynamicModule, ForwardReference } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AppConfig } from '../app.config';
import { AuthModule } from 'src/features/auth/auth.module';
import { UsersModule } from 'src/features/users/users.module';
import { PrismaModule } from 'src/features/prisma/prisma.module';
import { EstateModule } from 'src/features/estate/estate.module';
import { EstateServiceModule } from 'src/features/estate-service/estate-service.module';
import { PaymentModule } from 'src/features/payment/payment.module';


export const appModules: (
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference<any>
)[] = [
  // Allow to access .env file and validate env variables
  ConfigModule.forRoot(AppConfig.getInitConifg()),
  ClsModule.forRoot({
    global: true,
    middleware: { mount: true },
  }),
  // Logger framework that better then NestJS default logger
  LoggerModule.forRoot(AppConfig.getLoggerConfig()),

  
  // EventEmitter Module
  EventEmitterModule.forRoot({
    wildcard: true,
    delimiter: '.',
  }),
  ScheduleModule.forRoot(),
  AuthModule,
  UsersModule,
  PrismaModule,
  EstateModule,
  EstateServiceModule,
  PaymentModule
];
