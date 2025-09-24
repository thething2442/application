import { Inject, Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { DRIZZLE_ORM } from '../database/database.provider';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../drizzle/schema';
import { friends } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class FriendService {
  constructor(
    @Inject(DRIZZLE_ORM)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  async create(createFriendDto: CreateFriendDto) {
    const result = await this.db.insert(friends).values(createFriendDto).returning();
    return result[0];
  }

  async findAll() {
    return this.db.query.friends.findMany();
  }

  async findOne(id: number) {
    return this.db.query.friends.findFirst({
      where: eq(friends.id, id),
    });
  }

  async update(id: number, updateFriendDto: UpdateFriendDto) {
    const result = await this.db.update(friends).set(updateFriendDto).where(eq(friends.id, id)).returning();
    return result[0];
  }

  async remove(id: number) {
    const result = await this.db.delete(friends).where(eq(friends.id, id)).returning();
    return result[0];
  }
}
