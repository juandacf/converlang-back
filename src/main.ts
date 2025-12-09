// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(
//   new ValidationPipe({
//     whitelist: true,
//     forbidNonWhitelisted: true,
//     transform: true,
//   }),
// );

//   app.enableCors({
//     origin: 'http://localhost:5173',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true, 
//   }); 

//   //hola
//   await app.listen(process.env.APPPORT ?? 3000);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 👇 CAMBIO IMPORTANTE: Déjalo vacío por ahora para permitir CUALQUIER origen
  app.enableCors(); 

  await app.listen(process.env.APPPORT ?? 3000);
  console.log(`🚀 Servidor corriendo en: http://localhost:${process.env.APPPORT ?? 3000}`);
}
bootstrap();