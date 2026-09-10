import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/repositories/user.repository.port';
import { PasswordHasherService } from '../../infrastructure/password-hasher.service';

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const isValid = await this.passwordHasher.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    const decoded = this.jwtService.decode(accessToken) as { exp: number; iat: number };

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: decoded.exp - decoded.iat,
    };
  }
}
