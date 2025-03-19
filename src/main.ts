import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Order Management System')
    .setDescription('API documentation for the Order Management System. Endpoints documented includes Products, Orders and Users')
    .setVersion('1.0')
    .addTag('users', 'Operations about users')
    .addTag('products', 'Operations about products')
    .addTag('orders', 'Operations about orders')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();