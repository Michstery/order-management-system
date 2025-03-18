import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';

describe('UsersController (integration)', () => {
  let app: INestApplication;
  let service: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/test'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<UsersService>(UsersService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    if (service && service['userModel']) {
      await service['userModel'].deleteMany({});
    }
  });

  it('POST /users should create a user', async () => {
    const createUserDto = {
        name: 'Eunice',
        email: 'eunice@menaget.com',
        address: '123 Main St',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body.name).toEqual(createUserDto.name);
    expect(response.body.email).toEqual(createUserDto.email);
    expect(response.body.address).toEqual(createUserDto.address);
  });

  it('GET /users/:id should return a user', async () => {
    const createUserDto = {
        name: 'Eunice',
        email: 'eunice@menaget.com',
        address: '123 Main St',
    };

    const createdUser = await service.create(createUserDto);

    const response = await request(app.getHttpServer())
      .get(`/users/${createdUser._id}`)
      .expect(200);

    expect(response.body.name).toEqual(createUserDto.name);
    expect(response.body.email).toEqual(createUserDto.email);
  });

  it('GET /users/:id/orders should return user with orders', async () => {
    const createUserDto = {
      name: 'Eunice',
      email: 'eunice@menaget.com',
      address: '123 Main St',
    };

    const createdUser = await service.create(createUserDto);

    const response = await request(app.getHttpServer())
      .get(`/users/${createdUser._id}/orders`)
      .expect(200);

    expect(response.body.name).toEqual(createUserDto.name);
    expect(response.body.orders).toEqual([]);
  });
});