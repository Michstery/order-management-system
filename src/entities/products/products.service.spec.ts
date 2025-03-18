import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: Model<Product>;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
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
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        price: 99.99,
        description: 'Test Description',
      };

      jest.spyOn(productModel, 'create').mockResolvedValueOnce(mockProduct as any);

      const result = await service.create(createProductDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        select: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValueOnce(mockProduct),
          }),
        }),
      } as any);

      const result = await service.findOne(mockProduct._id);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        select: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValueOnce(null),
          }),
        }),
      } as any);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct];
      const mockPaginatedResult = {
        products: mockProducts,
        total: 1,
        pages: 1,
      };

      jest.spyOn(productModel, 'find').mockReturnValue({
        select: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => ({
                exec: jest.fn().mockResolvedValueOnce(mockProducts),
              }),
            }),
          }),
        }),
      } as any);

      jest.spyOn(productModel, 'countDocuments').mockResolvedValueOnce(1);

      const result = await service.findAll(1, 10);
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});