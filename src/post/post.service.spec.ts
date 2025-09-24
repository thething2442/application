import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { DRIZZLE_ORM } from '../database/database.provider';

const mockDb = {
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnValue([{ id: 1 }]),
  query: {
    posts: {
      findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      findFirst: jest.fn().mockResolvedValue({ id: 1 }),
    },
  },
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: DRIZZLE_ORM,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
