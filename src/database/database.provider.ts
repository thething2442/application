import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../drizzle/schema';
import Database from 'better-sqlite3';

export const DRIZZLE_ORM = 'DRIZZLE_ORM';

export const drizzleProvider: FactoryProvider = {
  provide: DRIZZLE_ORM,
  useFactory: (configService: ConfigService) => {
    const sqlite = new Database('sqlite.db');
    const db = drizzle(sqlite, { schema });
    return db;
  },
  inject: [ConfigService],
};
