import { Injectable } from '@nestjs/common';
import { WorkshopRepositoryPort } from '../domain/repositories/workshop.repository.port';
import { Workshop } from '../domain/entities/workshop.entity';
import { MongoPrismaService } from '../../../shared/persistence/mongo.service';

@Injectable()
export class PrismaWorkshopRepository implements WorkshopRepositoryPort {
  constructor(private readonly prisma: MongoPrismaService) {}

  async findById(id: string): Promise<Workshop | null> {
    const record = await this.prisma.workshop.findUnique({ where: { id } });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Workshop[]> {
    const records = await this.prisma.workshop.findMany({ orderBy: { createdAt: 'asc' } });
    return records.map((record) => this.toDomain(record));
  }

  async findByIds(ids: string[]): Promise<Workshop[]> {
    const records = await this.prisma.workshop.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    capacity: number;
    createdAt: Date;
  }): Workshop {
    return new Workshop(
      record.id,
      record.name,
      record.description,
      record.imageUrl,
      record.capacity,
      record.createdAt,
    );
  }
}
