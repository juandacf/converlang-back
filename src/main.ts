import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ CORS (necesario para frontend + socket)
  app.enableCors({
    origin: true, // permite https://192.168.x.x:5173
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Archivos estáticos
  app.useStaticAssets(join(process.cwd(), 'user-pics'), {
    prefix: '/user-pics',
  });

  // 🌐 IMPORTANTE: escuchar en la red
  const port = process.env.APPPORT ?? 3000;
  await app.listen(port, '0.0.0.0');


}

bootstrap();
