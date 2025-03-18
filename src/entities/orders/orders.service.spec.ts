import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: Model<Order>;

  const mockOrder = {
    _id: '507f1f77bcf86cd799439011',
    user: '507f1f77bcf86cd799439012',
    products: ['507f1f77bcf86cd799439013'],
    total: 99.99,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        user: '507f1f77bcf86cd799439012',
        products: ['507f1f77bcf86cd799439013'],
        total: 99.99,
      };

      jest.spyOn(orderModel, 'create').mockResolvedValueOnce(mockOrder as any);

      const result = await service.create(createOrderDto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        populate: () => ({
          populate: () => ({
            lean: () => ({
              exec: jest.fn().mockResolvedValueOnce(mockOrder),
            }),
          }),
        }),
      } as any);

      const result = await service.findOne(mockOrder._id);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        populate: () => ({
          populate: () => ({
            lean: () => ({
              exec: jest.fn().mockResolvedValueOnce(null),
            }),
          }),
        }),
      } as any);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [mockOrder];
      const mockPaginatedResult = {
        orders: mockOrders,
        total: 1,
        pages: 1,
      };

      jest.spyOn(orderModel, 'find').mockReturnValue({
        populate: () => ({
          populate: () => ({
            skip: () => ({
              limit: () => ({
                lean: () => ({
                  exec: jest.fn().mockResolvedValueOnce(mockOrders),
                }),
              }),
            }),
          }),
        }),
      } as any);

      jest.spyOn(orderModel, 'countDocuments').mockResolvedValueOnce(1);

      const result = await service.findAll(1, 10);
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});