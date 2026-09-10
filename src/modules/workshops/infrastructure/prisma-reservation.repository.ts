import { Injectable } from '@nestjs/common';
import { ReservationRepositoryPort } from '../domain/repositories/reservation.repository.port';
import { Reservation } from '../domain/entities/reservation.entity';
import { MongoPrismaService } from '../../../shared/persistence/mongo.service';

@Injectable()
export class PrismaReservationRepository implements ReservationRepositoryPort {
  constructor(private readonly prisma: MongoPrismaService) {}

  async findByUserAndWorkshop(
    userId: string,
    workshopId: string,
  ): Promise<Reservation | null> {
    const record = await this.prisma.reservation.findUnique({
      where: { userId_workshopId: { userId, workshopId } },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    const records = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async countByWorkshop(workshopId: string): Promise<number> {
    return this.prisma.reservation.count({ where: { workshopId } });
  }

  async create(userId: string, workshopId: string): Promise<Reservation> {
    const record = await this.prisma.reservation.create({
      data: { userId, workshopId },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    id: string;
    userId: string;
    workshopId: string;
    createdAt: Date;
  }): Reservation {
    return new Reservation(
      record.id,
      record.userId,
      record.workshopId,
      record.createdAt,
    );
  }
}
