/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend with environment-based origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000', 
        'http://localhost:3001',
        'https://shop-nest-premium.onrender.com',
        'https://shop-nest-premium.vercel.app',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove non-DTO properties
    forbidNonWhitelisted: true, // Throw error for non-DTO properties  
    transform: true, // Auto transform payloads
  }));
  
  const port = process.env.PORT || 10000; // Use PORT from environment or default to 10000
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  await app.listen(port, host);
  
  console.log(`🚀 Backend API server running on http://${host}:${port}/api`);
  console.log(`📚 Users API available at http://${host}:${port}/api/users`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
