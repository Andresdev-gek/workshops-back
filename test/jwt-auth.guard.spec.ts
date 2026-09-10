import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../src/shared/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../src/shared/decorators/public.decorator';

const SECRET = 'test-secret';

function createReflector(isPublic: boolean): Reflector {
  const reflector = new Reflector();
  reflector.getAllAndOverride = jest.fn().mockReturnValue(isPublic);
  return reflector;
}

function createContext(
  authorization?: string,
  isPublic = false,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authorization ? { authorization } : {},
      }),
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getHandler: () => function handler() {},
    getClass: () => ({} as any),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: SECRET,
      signOptions: { expiresIn: '1h' },
    });
  });

  it('should allow access to public routes without a token', async () => {
    guard = new JwtAuthGuard(createReflector(true), jwtService);
    const context = createContext();
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should reject access when Authorization header is missing', async () => {
    guard = new JwtAuthGuard(createReflector(false), jwtService);
    const context = createContext();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should reject access when token is malformed', async () => {
    guard = new JwtAuthGuard(createReflector(false), jwtService);
    const context = createContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should reject access when token has an invalid signature', async () => {
    guard = new JwtAuthGuard(createReflector(false), jwtService);
    const otherJwtService = new JwtService({
      secret: 'other-secret',
      signOptions: { expiresIn: '1h' },
    });
    const token = await otherJwtService.signAsync({ sub: 'user-1' });
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should reject access when token is expired', async () => {
    guard = new JwtAuthGuard(createReflector(false), jwtService);
    const expiredJwtService = new JwtService({
      secret: SECRET,
      signOptions: { expiresIn: '-1s' },
    });
    const token = await expiredJwtService.signAsync({ sub: 'user-1' });
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should allow access and populate request.user.sub with a valid token', async () => {
    guard = new JwtAuthGuard(createReflector(false), jwtService);
    const token = await jwtService.signAsync({ sub: 'user-1' });
    const request: { headers: { authorization: string }; user?: { sub: string } } =
      { headers: { authorization: `Bearer ${token}` } };

    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => undefined,
      }),
      getHandler: () => function handler() {},
      getClass: () => ({} as any),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toMatchObject({ sub: 'user-1' });
    expect(request.user?.sub).toBe('user-1');
  });
});
