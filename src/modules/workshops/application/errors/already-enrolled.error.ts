import { ConflictException } from '@nestjs/common';

export class AlreadyEnrolledError extends ConflictException {
  constructor() {
    super({
      error: 'ALREADY_ENROLLED',
      message: 'Ya tienes una reserva para este taller.',
    });
  }
}
