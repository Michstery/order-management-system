import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from '../../config/configuration';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;
  let orderModel: Model<Order>;
  let productModel: Model<Product>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/test'),
      ],
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn().mockReturnThis(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Order.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            lean: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      jest.spyOn(userModel, 'create').mockResolvedValueOnce(mockUser as any);

      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        }),
      } as any);

      const result = await service.findOne(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      } as any);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserOrders', () => {
    it('should return user orders', async () => {
      const mockOrders = [
        { _id: '1', total: 100 },
        { _id: '2', total: 200 },
      ];

      jest.spyOn(userModel, 'findById').mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        }),
      } as any);

      jest.spyOn(orderModel, 'find').mockReturnValue({
        populate: () => ({
          select: () => ({
            lean: () => ({
              exec: jest.fn().mockResolvedValueOnce(mockOrders),
            }),
          }),
        }),
      } as any);

      const result = await service.findUserOrders(mockUser._id);
      expect(result).toEqual({
        name: mockUser.name,
        email: mockUser.email,
        orders: mockOrders,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      } as any);

      await expect(service.findUserOrders('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});