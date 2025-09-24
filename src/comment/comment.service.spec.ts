import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { DRIZZLE_ORM } from '../database/database.provider';

const mockDb = {
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnValue([{ id: 1 }]),
  query: {
    comments: {
      findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      findFirst: jest.fn().mockResolvedValue({ id: 1 }),
    },
  },
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: DRIZZLE_ORM,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
