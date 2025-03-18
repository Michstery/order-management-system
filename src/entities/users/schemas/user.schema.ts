import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from '../../orders/schemas/order.schema';

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  address: string;

//   @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })
//   orders: Order[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('userOrders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user'
});