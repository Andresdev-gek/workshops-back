import { Inject, Injectable } from '@nestjs/common';
import {
  WORKSHOP_REPOSITORY,
  WorkshopRepositoryPort,
} from '../../domain/repositories/workshop.repository.port';
import {
  RESERVATION_REPOSITORY,
  ReservationRepositoryPort,
} from '../../domain/repositories/reservation.repository.port';
import {
  ListWorkshopsUseCase,
  WorkshopListItem,
} from './list-workshops.use-case';

@Injectable()
export class ListMyWorkshopsUseCase {
  constructor(
    @Inject(WORKSHOP_REPOSITORY)
    private readonly workshopRepository: WorkshopRepositoryPort,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
    private readonly listWorkshopsUseCase: ListWorkshopsUseCase,
  ) {}

  async execute(userId: string): Promise<WorkshopListItem[]> {
    const reservations = await this.reservationRepository.findByUser(userId);
    const workshopIds = reservations.map((r) => r.workshopId);

    if (workshopIds.length === 0) {
      return [];
    }

    const workshops = await this.workshopRepository.findByIds(workshopIds);
    const allWorkshops = await this.listWorkshopsUseCase.execute(userId);

    return allWorkshops.filter((w) => workshopIds.includes(w.id));
  }
}
