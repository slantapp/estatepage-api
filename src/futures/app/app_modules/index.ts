import { Type, DynamicModule, ForwardReference } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AppConfig } from '../app.config';
import { AuthModule } from 'src/futures/auth/auth.module';
import { UsersModule } from 'src/futures/users/users.module';
import { PrismaModule } from 'src/futures/prisma/prisma.module';


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
];
