import { Inject, Injectable } from '@nestjs/common';
import {
  WORKSHOP_REPOSITORY,
  WorkshopRepositoryPort,
} from '../../domain/repositories/workshop.repository.port';
import {
  RESERVATION_REPOSITORY,
  ReservationRepositoryPort,
} from '../../domain/repositories/reservation.repository.port';
import { Workshop } from '../../domain/entities/workshop.entity';

export interface WorkshopListItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  availableSlots: number;
  isFull: boolean;
  isLowAvailability: boolean;
  isEnrolled: boolean;
}

@Injectable()
export class ListWorkshopsUseCase {
  constructor(
    @Inject(WORKSHOP_REPOSITORY)
    private readonly workshopRepository: WorkshopRepositoryPort,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(userId: string): Promise<WorkshopListItem[]> {
    const workshops = await this.workshopRepository.findAll();
    return Promise.all(
      workshops.map((workshop) => this.mapWorkshop(workshop, userId)),
    );
  }

  private async mapWorkshop(
    workshop: Workshop,
    userId: string,
  ): Promise<WorkshopListItem> {
    const reservationCount = await this.reservationRepository.countByWorkshop(
      workshop.id,
    );
    const existingReservation =
      await this.reservationRepository.findByUserAndWorkshop(userId, workshop.id);

    const availableSlots = workshop.capacity - reservationCount;
    const isFull = availableSlots === 0;
    const threshold = Math.max(1, Math.ceil(workshop.capacity * 0.2));
    const isLowAvailability = availableSlots > 0 && availableSlots <= threshold;

    return {
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      imageUrl: workshop.imageUrl,
      capacity: workshop.capacity,
      availableSlots,
      isFull,
      isLowAvailability,
      isEnrolled: !!existingReservation,
    };
  }
}
