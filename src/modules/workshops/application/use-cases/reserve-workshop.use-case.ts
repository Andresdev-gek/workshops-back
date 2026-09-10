import { Inject, Injectable } from '@nestjs/common';
import {
  WORKSHOP_REPOSITORY,
  WorkshopRepositoryPort,
} from '../../domain/repositories/workshop.repository.port';
import {
  RESERVATION_REPOSITORY,
  ReservationRepositoryPort,
} from '../../domain/repositories/reservation.repository.port';
import { WorkshopNotFoundError } from '../errors/workshop-not-found.error';
import { WorkshopFullError } from '../errors/workshop-full.error';
import { AlreadyEnrolledError } from '../errors/already-enrolled.error';
import { ReservationResponseDto } from '../dto/reservation-response.dto';

@Injectable()
export class ReserveWorkshopUseCase {
  constructor(
    @Inject(WORKSHOP_REPOSITORY)
    private readonly workshopRepository: WorkshopRepositoryPort,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(userId: string, workshopId: string): Promise<ReservationResponseDto> {
    const workshop = await this.workshopRepository.findById(workshopId);

    if (!workshop) {
      throw new WorkshopNotFoundError();
    }

    const existingReservation = await this.reservationRepository.findByUserAndWorkshop(
      userId,
      workshopId,
    );

    if (existingReservation) {
      throw new AlreadyEnrolledError();
    }

    const reservationCount = await this.reservationRepository.countByWorkshop(workshopId);

    if (reservationCount >= workshop.capacity) {
      throw new WorkshopFullError();
    }

    const reservation = await this.reservationRepository.create(userId, workshopId);

    return {
      id: reservation.id,
      workshopId: reservation.workshopId,
      userId: reservation.userId,
      createdAt: reservation.createdAt.toISOString(),
    };
  }
}
