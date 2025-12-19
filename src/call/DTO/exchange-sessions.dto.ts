import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExchangeSessionDto {
  @IsInt()
  @Min(1)
  idUser1: number;

  @IsInt()
  @Min(1)
  idUser2: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sessionNotes?: string;
}
