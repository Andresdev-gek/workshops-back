import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { PasswordHasherService } from './infrastructure/password-hasher.service';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { USER_REPOSITORY } from './domain/repositories/user.repository.port';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    PasswordHasherService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
