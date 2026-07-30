import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Camiseta Edición Limitada' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Camiseta con estampado original y material premium' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 49.9 })
  @IsNumber()
  @Min(0.01)
  price!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
