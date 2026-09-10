import { Module } from '@nestjs/common';
import { WorkshopsController } from './presentation/workshops.controller';
import { ListWorkshopsUseCase } from './application/use-cases/list-workshops.use-case';
import { ListMyWorkshopsUseCase } from './application/use-cases/list-my-workshops.use-case';
import { ReserveWorkshopUseCase } from './application/use-cases/reserve-workshop.use-case';
import { PrismaWorkshopRepository } from './infrastructure/prisma-workshop.repository';
import { PrismaReservationRepository } from './infrastructure/prisma-reservation.repository';
import { WORKSHOP_REPOSITORY } from './domain/repositories/workshop.repository.port';
import { RESERVATION_REPOSITORY } from './domain/repositories/reservation.repository.port';

@Module({
  controllers: [WorkshopsController],
  providers: [
    ListWorkshopsUseCase,
    ListMyWorkshopsUseCase,
    ReserveWorkshopUseCase,
    {
      provide: WORKSHOP_REPOSITORY,
      useClass: PrismaWorkshopRepository,
    },
    {
      provide: RESERVATION_REPOSITORY,
      useClass: PrismaReservationRepository,
    },
  ],
})
export class WorkshopsModule {}
