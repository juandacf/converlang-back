import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';



async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  }); 

app.useStaticAssets(join(process.cwd(), 'user-pics'), {
  prefix: '/user-pics',
});


 
  await app.listen(process.env.APPPORT ?? 3000);


}
bootstrap();