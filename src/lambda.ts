import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { createConnection } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'reflect-metadata';
import './app/firebase';
import express = require('express');

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below
const binaryMimeTypes: string[] = [];

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.useGlobalPipes(new ValidationPipe());
    nestApp.enableCors();
    const config = new DocumentBuilder()
      .setTitle('fullstack-coding-test-backend')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api', nestApp, document);
    nestApp.use(eventContext());
    await nestApp.init();
    cachedServer = createServer(expressApp, undefined, binaryMimeTypes);
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  cachedServer = await bootstrapServer();
  await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    database: 'fullstack-coding-test-backend',
    synchronize: true,
    logging: false,
    entities: ['.build/src/entity/**/*.js'],
    migrations: ['.build/src/migration/**/*.js'],
    subscribers: ['.build/src/subscriber/**/*.js'],
    cli: {
      entitiesDir: '.build/src/entity',
      migrationsDir: '.build/src/migration',
      subscribersDir: '.build/src/subscriber',
    },
  });
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
