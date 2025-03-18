import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, @InjectModel(Order.name) private orderModel: Model<Order>, @InjectModel(Product.name) private productModel: Model<Product>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .lean()
      .exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findUserOrders(id: string): Promise<{ name: string; email: string; orders: Order[] }> {
    // First get the user
    const user = await this.userModel
      .findById(id)
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const orders = await this.orderModel
      .find({ user: id })
      .populate({
        path: 'products',
        model: 'Product',
        select: '-__v'
      })
      .select('-__v')
      .lean()
      .exec();

    return {
      name: user.name,
      email: user.email,
      orders
    };
  }
}