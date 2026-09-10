import { Workshop } from '../entities/workshop.entity';

export const WORKSHOP_REPOSITORY = Symbol('WORKSHOP_REPOSITORY');

export interface WorkshopRepositoryPort {
  findById(id: string): Promise<Workshop | null>;
  findAll(): Promise<Workshop[]>;
  findByIds(ids: string[]): Promise<Workshop[]>;
}
