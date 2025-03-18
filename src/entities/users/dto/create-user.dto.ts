import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'The username', example: 'Eunice' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The user email', example: 'eunice@menaget.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The user address', example: '2 Main Street, Lagos, CA 100001 Nigeria' })
  @IsString()
  address?: string;
}