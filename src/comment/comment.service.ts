import { Inject, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DRIZZLE_ORM } from '../database/database.provider';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../drizzle/schema';
import { comments } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CommentService {
  constructor(
    @Inject(DRIZZLE_ORM)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const result = await this.db.insert(comments).values(createCommentDto).returning();
    return result[0];
  }

  async findAll() {
    return this.db.query.comments.findMany();
  }

  async findOne(id: number) {
    return this.db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const result = await this.db.update(comments).set(updateCommentDto).where(eq(comments.id, id)).returning();
    return result[0];
  }

  async remove(id: number) {
    const result = await this.db.delete(comments).where(eq(comments.id, id)).returning();
    return result[0];
  }
}
