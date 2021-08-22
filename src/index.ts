import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from 'typeorm';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import './app/firebase';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap()
  .then(() => {
    return createConnection();
  })
  .then(async () => {
    console.log('created DB Connection');
  })
  .catch((error) => console.log(error));
