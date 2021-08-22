import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from 'typeorm';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import './app/firebase';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('fullstack-coding-test-backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
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
