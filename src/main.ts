import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
  // 🔐 HTTPS options (mkcert)
  const httpsOptions = {
    key: fs.readFileSync('localhost+3-key.pem'),
    cert: fs.readFileSync('localhost+3.pem'),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

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

  console.log(`🚀 Backend HTTPS corriendo en https://0.0.0.0:${port}`);
}

bootstrap();
