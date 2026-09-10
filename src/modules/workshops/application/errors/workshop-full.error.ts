import { ConflictException } from '@nestjs/common';

export class WorkshopFullError extends ConflictException {
  constructor() {
    super({
      error: 'WORKSHOP_FULL',
      message: 'No hay cupos disponibles para este taller.',
    });
  }
}
