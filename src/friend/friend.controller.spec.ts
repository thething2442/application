import { Test, TestingModule } from '@nestjs/testing';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { DRIZZLE_ORM } from '../database/database.provider';

describe('FriendController', () => {
  let controller: FriendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendController],
      providers: [
        FriendService,
        {
          provide: DRIZZLE_ORM,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FriendController>(FriendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
