import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DRIZZLE_ORM } from '../database/database.provider';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../drizzle/schema';
import { posts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PostService {
  constructor(
    @Inject(DRIZZLE_ORM)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const result = await this.db.insert(posts).values(createPostDto).returning();
    return result[0];
  }

  async findAll() {
    return this.db.query.posts.findMany();
  }

  async findOne(id: number) {
    return this.db.query.posts.findFirst({
      where: eq(posts.id, id),
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const result = await this.db.update(posts).set(updatePostDto).where(eq(posts.id, id)).returning();
    return result[0];
  }

  async remove(id: number) {
    const result = await this.db.delete(posts).where(eq(posts.id, id)).returning();
    return result[0];
  }
}
