import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5173', // Local development (Vite default)
    'http://localhost:5174', // Local development (Vite fallback)
    'http://localhost:3001', // Local development (alternative)
    'http://localhost:3000', // Local API
    'http://127.0.0.1:5173', // Local development (IPv4)
    'http://127.0.0.1:3001', // Local development (IPv4)
    'https://lixeta.onrender.com', // Production backend
    'https://lixeta-ui.onrender.com', // Production frontend
    'https://www.lixeta.com', // Production frontend
    'https://lixeta.vercel.app', // Vercel deployed frontend
  ];

  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`✓ ASTELIX running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('ASTELIX failed to start', err);
  process.exit(1);
});
