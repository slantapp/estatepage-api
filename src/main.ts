import { NestApplication, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './features/app';
import { config } from 'dotenv';
import helmet from 'helmet';

const { BASE_PATH, PORT } = process.env ;

async function bootstrap() {
  const INADDR_ANY = '0.0.0.0';

  const app = await NestFactory.create<NestApplication>(AppModule);

  // Enable versioning
  app.enableVersioning();

  // Security headers
  app.use(helmet());

  // Enable CORS for Swagger UI
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators in the DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  // Set global prefix
  app.setGlobalPrefix(BASE_PATH || 'api');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation for the application')
    .setVersion('1.0')
    .addTag('Users') // Add tags as needed for grouping
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger UI at /api-docs
  SwaggerModule.setup('api-docs', app, document);

  
  // Start the application
  await app.listen(PORT || 3000, INADDR_ANY);
}

bootstrap();