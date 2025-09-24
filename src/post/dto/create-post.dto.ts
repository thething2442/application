import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;
}
