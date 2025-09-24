import { Module } from '@nestjs/common';
import { drizzleProvider } from './database.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DatabaseModule {}
