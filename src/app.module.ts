import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { PostModule } from './post/post.module';
import { FriendModule } from './friend/friend.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [UserModule, DatabaseModule, PostModule, CommentModule, FriendModule],
  controllers: [],
  providers: [],
})
export class AppModule { }