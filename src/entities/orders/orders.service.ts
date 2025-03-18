import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderModel.create(createOrderDto);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'name email -_id')
      .populate('products', '-__v')
      .lean()
      .exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findAll(page = 1, limit = 10): Promise<{ orders: Order[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.orderModel
        .find()
        .populate('user', 'name email -_id')
        .populate('products', '-__v')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.orderModel.countDocuments()
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit)
    };
  }
}