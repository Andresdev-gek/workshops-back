import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ListWorkshopsUseCase } from '../application/use-cases/list-workshops.use-case';
import { ListMyWorkshopsUseCase } from '../application/use-cases/list-my-workshops.use-case';
import { ReserveWorkshopUseCase } from '../application/use-cases/reserve-workshop.use-case';
import { ReservationResponseDto } from '../application/dto/reservation-response.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: { sub: string };
}

@Controller('workshops')
export class WorkshopsController {
  constructor(
    private readonly listWorkshopsUseCase: ListWorkshopsUseCase,
    private readonly listMyWorkshopsUseCase: ListMyWorkshopsUseCase,
    private readonly reserveWorkshopUseCase: ReserveWorkshopUseCase,
  ) {}

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.listWorkshopsUseCase.execute(req.user.sub);
  }

  @Get('mine')
  async findMine(@Request() req: AuthenticatedRequest) {
    return this.listMyWorkshopsUseCase.execute(req.user.sub);
  }

  @Post(':id/reservations')
  @HttpCode(HttpStatus.CREATED)
  async reserve(
    @Param('id') workshopId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ReservationResponseDto> {
    return this.reserveWorkshopUseCase.execute(req.user.sub, workshopId);
  }
}
