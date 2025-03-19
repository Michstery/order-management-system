import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Invalidate cache for findAll since a new product was added
    await this.cacheManager.del('products_all');
    return this.productModel.create(createProductDto);
  }

  async findAll(page = 1, limit = 10): Promise<{ products: Product[]; total: number; pages: number }> {
    const cacheKey = 'products_all';
    // Check cache first
    const cachedData = await this.cacheManager.get<{ products: Product[]; total: number; pages: number }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      this.productModel
        .find()
        .select('-__v')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments()
    ]);

    const result = {
      products,
      total,
      pages: Math.ceil(total / limit)
    };

    // Cache the complete result
    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product_${id}`;
    // Check cache first
    const cachedProduct = await this.cacheManager.get<Product>(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productModel
      .findById(id)
      .select('-__v')
      .lean()
      .exec();
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

      // Store in cache with TTL (default from module config)
      await this.cacheManager.set(cacheKey, product);

      return product;
  }
}