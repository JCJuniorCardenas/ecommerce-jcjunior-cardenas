import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const mockCategory = {
    id: 1,
    name: 'Test Category',
    description: 'A test category',
    products: [],
  };

  const mockPrisma: any = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    mockPrisma.category.create.mockReset();
    mockPrisma.category.findMany.mockReset();
    mockPrisma.category.findUnique.mockReset();
    mockPrisma.category.update.mockReset();
    mockPrisma.category.delete.mockReset();
    service = new CategoriesService(mockPrisma as any);
  });

  it('should create a category', async () => {
    mockPrisma.category.create.mockResolvedValue(mockCategory);
    const result = await service.create({ name: 'Test Category' } as any);

    expect(result).toEqual(mockCategory);
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Category',
      },
    });
  });

  it('should list categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
    const result = await service.findAll();

    expect(result).toEqual([mockCategory]);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('should return a category by id', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    const result = await service.findOne(1);

    expect(result).toEqual(mockCategory);
    expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { products: true },
    });
  });

  it('should throw when category not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.category.update.mockResolvedValue({ ...mockCategory, name: 'Updated' });

    const result = await service.update(1, { name: 'Updated' } as any);

    expect(result).toEqual({ ...mockCategory, name: 'Updated' });
    expect(mockPrisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated' },
    });
  });

  it('should delete a category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.category.delete.mockResolvedValue(mockCategory);

    const result = await service.remove(1);

    expect(result).toEqual(mockCategory);
    expect(mockPrisma.category.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
