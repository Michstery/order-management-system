import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products.module';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import configuration from '../../config/configuration';

describe('ProductsController (integration)', () => {
  let app: INestApplication;
  let service: ProductsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/test'),
        CacheModule.register({
          ttl: 60,
          max: 100,
          isGlobal: true,
        }),
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<ProductsService>(ProductsService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    if (service && service['productModel']) {
      await service['productModel'].deleteMany({});
    }
  });

  it('POST /products should create a product', async () => {
    const createProductDto = {
      name: 'Test Product',
      price: 99.99,
      description: 'Test Description',
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(createProductDto)
      .expect(201);

    expect(response.body.name).toEqual(createProductDto.name);
    expect(response.body.price).toEqual(createProductDto.price);
    expect(response.body.description).toEqual(createProductDto.description);
  });

  it('GET /products/:id should return a product', async () => {
    const createProductDto = {
      name: 'Test Product',
      price: 99.99,
      description: 'Test Description',
    };

    const createdProduct = await service.create(createProductDto);

    const response = await request(app.getHttpServer())
      .get(`/products/${createdProduct._id}`)
      .expect(200);

    expect(response.body.name).toEqual(createProductDto.name);
    expect(response.body.price).toEqual(createProductDto.price);
    expect(response.body.description).toEqual(createProductDto.description);
  });

  it('GET /products should return all products', async () => {
    const createProductDto = {
      name: 'Test Product',
      price: 99.99,
      description: 'Test Description',
    };

    await service.create(createProductDto);

    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toEqual(createProductDto.name);
    expect(response.body.products[0].price).toEqual(createProductDto.price);
    expect(response.body.products[0].description).toEqual(createProductDto.description);
    expect(response.body.total).toBe(1);
    expect(response.body.pages).toBe(1);
  });
});