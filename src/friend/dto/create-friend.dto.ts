import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

enum FriendStatus { 
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export class CreateFriendDto {
  @IsNumber()
  @IsNotEmpty()
  userId1: number;

  @IsNumber()
  @IsNotEmpty()
  userId2: number;

  @IsEnum(FriendStatus)
  @IsNotEmpty()
  status: FriendStatus;
}
