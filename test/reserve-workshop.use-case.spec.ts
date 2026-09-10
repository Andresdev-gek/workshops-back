import { Workshop } from '../src/modules/workshops/domain/entities/workshop.entity';
import { Reservation } from '../src/modules/workshops/domain/entities/reservation.entity';
import { WorkshopRepositoryPort } from '../src/modules/workshops/domain/repositories/workshop.repository.port';
import { ReservationRepositoryPort } from '../src/modules/workshops/domain/repositories/reservation.repository.port';
import { ReserveWorkshopUseCase } from '../src/modules/workshops/application/use-cases/reserve-workshop.use-case';
import { WorkshopFullError } from '../src/modules/workshops/application/errors/workshop-full.error';
import { AlreadyEnrolledError } from '../src/modules/workshops/application/errors/already-enrolled.error';

class InMemoryWorkshopRepository implements WorkshopRepositoryPort {
  private workshops: Map<string, Workshop> = new Map();

  add(workshop: Workshop): void {
    this.workshops.set(workshop.id, workshop);
  }

  async findById(id: string): Promise<Workshop | null> {
    return this.workshops.get(id) ?? null;
  }

  async findAll(): Promise<Workshop[]> {
    return Array.from(this.workshops.values());
  }

  async findByIds(ids: string[]): Promise<Workshop[]> {
    return ids
      .map((id) => this.workshops.get(id))
      .filter((w): w is Workshop => !!w);
  }
}

class InMemoryReservationRepository implements ReservationRepositoryPort {
  private reservations: Reservation[] = [];

  async findByUserAndWorkshop(
    userId: string,
    workshopId: string,
  ): Promise<Reservation | null> {
    return (
      this.reservations.find(
        (r) => r.userId === userId && r.workshopId === workshopId,
      ) ?? null
    );
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservations.filter((r) => r.userId === userId);
  }

  async countByWorkshop(workshopId: string): Promise<number> {
    return this.reservations.filter((r) => r.workshopId === workshopId).length;
  }

  async create(userId: string, workshopId: string): Promise<Reservation> {
    const reservation = new Reservation(
      `reservation-${this.reservations.length + 1}`,
      userId,
      workshopId,
      new Date(),
    );
    this.reservations.push(reservation);
    return reservation;
  }

  getAll(): Reservation[] {
    return this.reservations;
  }
}

describe('ReserveWorkshopUseCase', () => {
  let useCase: ReserveWorkshopUseCase;
  let workshopRepository: InMemoryWorkshopRepository;
  let reservationRepository: InMemoryReservationRepository;

  beforeEach(() => {
    workshopRepository = new InMemoryWorkshopRepository();
    reservationRepository = new InMemoryReservationRepository();
    useCase = new ReserveWorkshopUseCase(
      workshopRepository,
      reservationRepository,
    );
  });

  it('should create a reservation when slots are available', async () => {
    workshopRepository.add(
      new Workshop('workshop-1', 'Taller', 'Desc', 'https://img', 3, new Date()),
    );

    const result = await useCase.execute('user-1', 'workshop-1');

    expect(result.workshopId).toBe('workshop-1');
    expect(result.userId).toBe('user-1');
    expect(reservationRepository.getAll()).toHaveLength(1);
  });

  it('should throw WorkshopFullError when no slots are available', async () => {
    workshopRepository.add(
      new Workshop('workshop-1', 'Taller', 'Desc', 'https://img', 1, new Date()),
    );
    await useCase.execute('user-1', 'workshop-1');

    await expect(useCase.execute('user-2', 'workshop-1')).rejects.toBeInstanceOf(
      WorkshopFullError,
    );
  });

  it('should throw AlreadyEnrolledError and not create a duplicate reservation', async () => {
    workshopRepository.add(
      new Workshop('workshop-1', 'Taller', 'Desc', 'https://img', 3, new Date()),
    );
    await useCase.execute('user-1', 'workshop-1');

    await expect(useCase.execute('user-1', 'workshop-1')).rejects.toBeInstanceOf(
      AlreadyEnrolledError,
    );
    expect(reservationRepository.getAll()).toHaveLength(1);
  });
});
