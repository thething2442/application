import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE_ORM } from '../database/database.provider';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../drizzle/schema';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_ORM)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const result = await this.db.insert(users).values(createUserDto).returning();
    return result[0];
  }

  async findAll() {
    return this.db.query.users.findMany();
  }

  async findOne(id: number) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findByClerkId(clerkId: string) {
    return this.db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.db.update(users).set(updateUserDto).where(eq(users.id, id)).returning();
    return result[0];
  }

  async remove(id: number) {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result[0];
  }
}