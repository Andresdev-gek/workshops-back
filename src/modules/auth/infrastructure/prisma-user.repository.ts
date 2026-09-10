import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../domain/repositories/user.repository.port';
import { User } from '../domain/entities/user.entity';
import { PostgresPrismaService } from '../../../shared/persistence/postgres.service';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PostgresPrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });

    if (!record) {
      return null;
    }

    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.name,
      record.createdAt,
    );
  }
}
