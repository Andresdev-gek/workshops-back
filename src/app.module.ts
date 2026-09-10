import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { SharedModule } from './shared/shared.module';
import { envSchema } from './shared/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => envSchema.parse(config),
    }),
    SharedModule,
    AuthModule,
    WorkshopsModule,
  ],
})
export class AppModule {}
