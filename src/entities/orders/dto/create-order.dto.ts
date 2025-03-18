import { IsArray, IsNotEmpty, IsNumber, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'The ID of the user placing the order',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @ApiProperty({
    description: 'Array of product IDs to be included in the order',
    example: ['507f191e810c19729de860ea', '507f191e810c19729de860eb'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  products: string[];

  @ApiProperty({
    description: 'Total amount for the order',
    example: 99.99,
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;
}