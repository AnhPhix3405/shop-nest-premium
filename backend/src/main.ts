/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Next.js và dev servers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove non-DTO properties
    forbidNonWhitelisted: true, // Throw error for non-DTO properties  
    transform: true, // Auto transform payloads
  }));
  
  const port = process.env.PORT ?? 4000; // Đổi thành 4000 để tránh conflict với Next.js
  await app.listen(port);
  
  console.log(`🚀 Backend API server running on http://localhost:${port}/api`);
  console.log(`📚 Users API available at http://localhost:${port}/api/users`);
}
bootstrap();
