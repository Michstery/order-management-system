import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders.module';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

describe('OrdersController (integration)', () => {
  let app: INestApplication;
  let service: OrdersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/test'),
        OrdersModule,
        UsersModule,
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<OrdersService>(OrdersService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    if (service && service['orderModel']) {
      await service['orderModel'].deleteMany({});
    }
  });

  it('POST /orders should create an order', async () => {
    const createOrderDto = {
      user: '507f1f77bcf86cd799439012',
      products: ['507f1f77bcf86cd799439013'],
      total: 99.99,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    expect(response.body.user).toBeDefined();
    expect(response.body.products).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(response.body.total).toEqual(createOrderDto.total);
  });

  it('GET /orders/:id should return an order', async () => {
    const createOrderDto = {
      user: '507f1f77bcf86cd799439012',
      products: ['507f1f77bcf86cd799439013'],
      total: 99.99,
    };

    const createdOrder = await service.create(createOrderDto);

    const response = await request(app.getHttpServer())
      .get(`/orders/${createdOrder._id}`)
      .expect(200);

    expect(response.body.user).toBeDefined();
    expect(response.body.products).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(response.body.total).toEqual(createOrderDto.total);
  });

  it('GET /orders should return all orders', async () => {
    const createOrderDto = {
      user: '507f1f77bcf86cd799439012',
      products: ['507f1f77bcf86cd799439013'],
      total: 99.99,
    };

    await service.create(createOrderDto);

    const response = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);

    expect(response.body.orders).toHaveLength(1);
    expect(response.body.orders[0].user).toBeDefined();
    expect(response.body.orders[0].products).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(response.body.orders[0].total).toEqual(createOrderDto.total);
    expect(response.body.total).toBeDefined();
    expect(response.body.pages).toBeDefined();
  });
});