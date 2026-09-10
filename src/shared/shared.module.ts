import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PostgresPrismaService } from './persistence/postgres.service';
import { MongoPrismaService } from './persistence/mongo.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { Env } from './config/env.validation';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
  ],
  providers: [
    PostgresPrismaService,
    MongoPrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [PostgresPrismaService, MongoPrismaService, JwtModule],
})
export class SharedModule {}
