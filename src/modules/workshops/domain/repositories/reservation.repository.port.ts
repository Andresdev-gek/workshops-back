import { Reservation } from '../entities/reservation.entity';

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface ReservationRepositoryPort {
  findByUserAndWorkshop(userId: string, workshopId: string): Promise<Reservation | null>;
  findByUser(userId: string): Promise<Reservation[]>;
  countByWorkshop(workshopId: string): Promise<number>;
  create(userId: string, workshopId: string): Promise<Reservation>;
}
