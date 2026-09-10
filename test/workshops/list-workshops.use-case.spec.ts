import { Workshop } from '../../src/modules/workshops/domain/entities/workshop.entity';
import { Reservation } from '../../src/modules/workshops/domain/entities/reservation.entity';
import { WorkshopRepositoryPort } from '../../src/modules/workshops/domain/repositories/workshop.repository.port';
import { ReservationRepositoryPort } from '../../src/modules/workshops/domain/repositories/reservation.repository.port';
import { ListWorkshopsUseCase } from '../../src/modules/workshops/application/use-cases/list-workshops.use-case';

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

  add(reservation: Reservation): void {
    this.reservations.push(reservation);
  }

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
}

describe('ListWorkshopsUseCase', () => {
  let useCase: ListWorkshopsUseCase;
  let workshopRepository: InMemoryWorkshopRepository;
  let reservationRepository: InMemoryReservationRepository;

  beforeEach(() => {
    workshopRepository = new InMemoryWorkshopRepository();
    reservationRepository = new InMemoryReservationRepository();
    useCase = new ListWorkshopsUseCase(
      workshopRepository,
      reservationRepository,
    );
  });

  it('should calculate available slots and flags correctly', async () => {
    workshopRepository.add(
      new Workshop('ws-1', 'Taller A', 'Desc', 'https://img', 5, new Date()),
    );
    workshopRepository.add(
      new Workshop('ws-2', 'Taller B', 'Desc', 'https://img', 1, new Date()),
    );
    reservationRepository.add(
      new Reservation('r-1', 'user-1', 'ws-1', new Date()),
    );

    const result = await useCase.execute('user-1');

    const tallerA = result.find((w) => w.id === 'ws-1');
    const tallerB = result.find((w) => w.id === 'ws-2');

    expect(tallerA?.availableSlots).toBe(4);
    expect(tallerA?.isFull).toBe(false);
    expect(tallerA?.isEnrolled).toBe(true);

    expect(tallerB?.availableSlots).toBe(1);
    expect(tallerB?.isFull).toBe(false);
    expect(tallerB?.isLowAvailability).toBe(true);
    expect(tallerB?.isEnrolled).toBe(false);
  });

  it('should mark a workshop as full when capacity is reached', async () => {
    workshopRepository.add(
      new Workshop('ws-1', 'Taller Lleno', 'Desc', 'https://img', 2, new Date()),
    );
    reservationRepository.add(
      new Reservation('r-1', 'user-1', 'ws-1', new Date()),
    );
    reservationRepository.add(
      new Reservation('r-2', 'user-2', 'ws-1', new Date()),
    );

    const result = await useCase.execute('user-1');
    const workshop = result[0];

    expect(workshop.availableSlots).toBe(0);
    expect(workshop.isFull).toBe(true);
    expect(workshop.isLowAvailability).toBe(false);
  });
});
