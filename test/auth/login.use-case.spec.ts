import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../../src/modules/auth/application/use-cases/login.use-case';
import { PasswordHasherService } from '../../src/modules/auth/infrastructure/password-hasher.service';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../src/modules/auth/domain/repositories/user.repository.port';
import { User } from '../../src/modules/auth/domain/entities/user.entity';

const SECRET = 'test-secret';

class InMemoryUserRepository implements UserRepositoryPort {
  private users: User[] = [];

  add(user: User): void {
    this.users.push(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }
}

const plainPasswordHasher: PasswordHasherService = {
  hash: async (password: string) => password,
  compare: async (password: string, hash: string) => password === hash,
} as PasswordHasherService;

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: InMemoryUserRepository;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    jwtService = new JwtService({
      secret: SECRET,
      signOptions: { expiresIn: '1h' },
    });
    useCase = new LoginUseCase(
      userRepository,
      plainPasswordHasher,
      jwtService,
    );
  });

  it('should return an access token when credentials are valid', async () => {
    userRepository.add(
      new User(
        'user-1',
        'ana@example.com',
        'Password123!',
        'Ana Gómez',
        new Date(),
      ),
    );

    const result = await useCase.execute('ana@example.com', 'Password123!');

    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(3600);
    expect(result.accessToken).toBeDefined();
  });

  it('should throw UnauthorizedException when email does not exist', async () => {
    await expect(
      useCase.execute('missing@example.com', 'Password123!'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    userRepository.add(
      new User(
        'user-1',
        'ana@example.com',
        'Password123!',
        'Ana Gómez',
        new Date(),
      ),
    );

    await expect(
      useCase.execute('ana@example.com', 'WrongPassword!'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
