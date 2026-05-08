import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class QueryRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  query!: string;
}
