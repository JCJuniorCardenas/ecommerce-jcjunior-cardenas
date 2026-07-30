import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from '../../common/config/cloudinary.config';
import { v2 as cloudinary } from 'cloudinary';

interface FindAllParams {
  page: number;
  limit: number;
  categoryId?: number;
  search?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    configureCloudinary(this.configService);
  }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
      },
      include: { category: true },
    });
  }

  async findAll(params: FindAllParams) {
    const { page, limit, categoryId, search } = params;
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const items = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return {
      page,
      limit,
      items,
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    await this.findOne(id);

    const cloudinaryClient = cloudinary;
    const fileBuffer = file.buffer;
    const uploadResponse = await cloudinaryClient.uploader.upload(
      `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`,
      {
        folder: 'ecommerce/products',
      },
    );

    return this.prisma.product.update({
      where: { id },
      data: {
        imageUrl: uploadResponse.secure_url,
      },
      include: { category: true },
    });
  }
}
