import { NotFoundException } from '@nestjs/common';

export class WorkshopNotFoundError extends NotFoundException {
  constructor() {
    super({
      error: 'WORKSHOP_NOT_FOUND',
      message: 'El taller solicitado no existe.',
    });
  }
}
