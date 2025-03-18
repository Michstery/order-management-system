import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'The product name', example: 'Fan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The product price in USD', example: '7' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The product description', example: 'A Simple Fan' })
  @IsString()
  @IsOptional()
  description?: string;
}